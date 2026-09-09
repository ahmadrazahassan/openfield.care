// Generated from src/lib/sheets/edge-entry.ts. Do not edit directly.

// src/lib/sheets/edge-entry.ts
import { timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { createClient } from "@supabase/supabase-js";

// src/lib/sheets/google-client.ts
import { GoogleAuth } from "google-auth-library";

// src/lib/sheets/core.ts
var SHEET_HEADERS = [
  "Appointment ID",
  "Booking reference",
  "Client name",
  "Email",
  "Phone",
  "Therapist",
  "Service",
  "Starts at (UTC)",
  "Ends at (UTC)",
  "Session type",
  "Status",
  "Price",
  "Currency",
  "Updated at (UTC)",
  "Therapist ID (system)",
  "Service ID (system)"
];
function sheetValues(b) {
  return [
    b.id,
    b.reference,
    b.name,
    b.email,
    b.phone,
    b.therapist,
    b.service,
    b.starts_at,
    b.ends_at,
    b.modality,
    b.status,
    b.price_cents / 100,
    b.currency,
    b.updated_at,
    b.therapist_id,
    b.service_id
  ];
}
function sheetRange(tab, row) {
  if (!Number.isSafeInteger(row) || row < 1) throw new Error("Invalid sheet row");
  return `'${tab.replaceAll("'", "''")}'!A${row}:P${row}`;
}
var SheetSyncError = class extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
};
async function processSheetJobs(store, write, options = { limit: 10, budgetMs: 35e3 }) {
  const started = Date.now();
  const result = { synced: 0, failed: 0 };
  for (let i = 0; i < options.limit && Date.now() - started < options.budgetMs; i++) {
    const job = await store.claim();
    if (!job) break;
    let error = null;
    try {
      await write(job);
    } catch (cause) {
      error = cause instanceof SheetSyncError ? cause.code : "sheet_write_failed";
    }
    await store.finish(job, error);
    if (error) {
      result.failed++;
      break;
    }
    result.synced++;
  }
  return result;
}

// src/lib/sheets/google-client.ts
async function createSheetBridge(config) {
  const auth = new GoogleAuth({
    credentials: { client_email: config.email, private_key: config.privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    clientOptions: { transporterOptions: { timeout: 1e4, retry: false } }
  });
  const client = await auth.getClient();
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}`;
  const metadata = await client.request({ url: base, params: { fields: "sheets.properties" }, timeout: 1e4, retry: false });
  const sheet = metadata.data.sheets.find((s) => s.properties.title === config.tab)?.properties;
  if (!sheet) throw new SheetSyncError("sheet_tab_missing");
  async function ensureCapacity(row) {
    if (sheet.gridProperties.rowCount >= row && sheet.gridProperties.columnCount >= 16) return;
    const rowCount = Math.max(row + 100, sheet.gridProperties.rowCount);
    const columnCount = Math.max(16, sheet.gridProperties.columnCount);
    const requests = [];
    if (rowCount > sheet.gridProperties.rowCount) requests.push({ appendDimension: {
      sheetId: sheet.sheetId,
      dimension: "ROWS",
      length: rowCount - sheet.gridProperties.rowCount
    } });
    if (columnCount > sheet.gridProperties.columnCount) requests.push({ appendDimension: {
      sheetId: sheet.sheetId,
      dimension: "COLUMNS",
      length: columnCount - sheet.gridProperties.columnCount
    } });
    await client.request({
      url: `${base}:batchUpdate`,
      method: "POST",
      timeout: 1e4,
      retry: false,
      data: { requests }
    });
    sheet.gridProperties = { rowCount, columnCount };
  }
  async function put(row, values) {
    await client.request({
      url: `${base}/values/${encodeURIComponent(sheetRange(config.tab, row))}`,
      method: "PUT",
      params: { valueInputOption: "RAW" },
      data: { majorDimension: "ROWS", values: [values] },
      timeout: 1e4,
      retry: false
    });
  }
  const textValue = (value) => value == null ? "" : String(value);
  function valuesMatch(current, expected) {
    return expected.every((value, index) => textValue(current[index]) === textValue(value));
  }
  async function updateDropdowns(lastRow) {
    const allRowsEnd = Math.max(2, sheet.gridProperties.rowCount);
    const requests = [{ setDataValidation: {
      range: { sheetId: sheet.sheetId, startRowIndex: 1, endRowIndex: allRowsEnd, startColumnIndex: 10, endColumnIndex: 11 },
      rule: null
    } }];
    if (config.therapistOptions) requests.unshift({ setDataValidation: {
      range: { sheetId: sheet.sheetId, startRowIndex: 1, endRowIndex: allRowsEnd, startColumnIndex: 5, endColumnIndex: 6 },
      rule: null
    } });
    const listRule = (values) => ({
      condition: { type: "ONE_OF_LIST", values: values.map((userEnteredValue) => ({ userEnteredValue })) },
      strict: true,
      showCustomUi: true
    });
    if (lastRow >= 2) {
      if (config.therapistOptions?.length) requests.push({ setDataValidation: {
        range: { sheetId: sheet.sheetId, startRowIndex: 1, endRowIndex: lastRow, startColumnIndex: 5, endColumnIndex: 6 },
        rule: listRule(config.therapistOptions)
      } });
      requests.push({ setDataValidation: {
        range: { sheetId: sheet.sheetId, startRowIndex: 1, endRowIndex: lastRow, startColumnIndex: 10, endColumnIndex: 11 },
        rule: listRule(["pending", "confirmed", "completed", "cancelled", "no_show"])
      } });
    }
    await client.request({
      url: `${base}:batchUpdate`,
      method: "POST",
      timeout: 1e4,
      retry: false,
      data: { requests }
    });
  }
  async function clearRows(startRow) {
    const endRow = sheet.gridProperties.rowCount;
    if (startRow > endRow) return;
    await client.request({
      url: `${base}/values/${encodeURIComponent(`'${config.tab.replaceAll("'", "''")}'!A${startRow}:P${endRow}`)}:clear`,
      method: "POST",
      data: {},
      timeout: 1e4,
      retry: false
    });
  }
  async function replaceRows(rows) {
    const lastRow = rows.length ? rows[rows.length - 1].sheet_row : 1;
    await ensureCapacity(Math.max(1, lastRow));
    if (rows.length) {
      await client.request({
        url: `${base}/values:batchUpdate`,
        method: "POST",
        params: { valueInputOption: "RAW" },
        data: {
          valueInputOption: "RAW",
          data: rows.map(({ sheet_row, payload }) => ({
            range: sheetRange(config.tab, sheet_row),
            majorDimension: "ROWS",
            values: [sheetValues(payload)]
          }))
        },
        timeout: 1e4,
        retry: false
      });
    }
    await clearRows(lastRow + 1);
    await updateDropdowns(lastRow);
  }
  async function readRows() {
    try {
      const response = await client.request({
        url: `${base}/values/${encodeURIComponent(`'${config.tab.replaceAll("'", "''")}'!A2:P1001`)}`,
        params: { majorDimension: "ROWS", valueRenderOption: "UNFORMATTED_VALUE" },
        timeout: 1e4,
        retry: false
      });
      return response.data.values ?? [];
    } catch {
      throw new SheetSyncError("google_read_failed");
    }
  }
  async function hideSystemColumns() {
    await client.request({
      url: `${base}:batchUpdate`,
      method: "POST",
      timeout: 1e4,
      retry: false,
      data: { requests: [{ updateDimensionProperties: {
        range: { sheetId: sheet.sheetId, dimension: "COLUMNS", startIndex: 14, endIndex: 16 },
        properties: { hiddenByUser: true },
        fields: "hiddenByUser"
      } }] }
    });
  }
  await ensureCapacity(1);
  await put(1, SHEET_HEADERS);
  await hideSystemColumns();
  await updateDropdowns(1);
  return {
    readRows,
    async syncSnapshot(rows, currentRows) {
      const expected = rows.map(({ payload }) => sheetValues(payload));
      const unchanged = currentRows.length === expected.length && expected.every((values, index) => valuesMatch(currentRows[index], values));
      if (unchanged) {
        await updateDropdowns(rows.length ? rows[rows.length - 1].sheet_row : 1);
        return;
      }
      try {
        await replaceRows(rows);
      } catch {
        throw new SheetSyncError("google_snapshot_write_failed");
      }
    },
    async write(job) {
      try {
        await ensureCapacity(job.sheet_row);
        await put(job.sheet_row, sheetValues(job.payload));
      } catch {
        throw new SheetSyncError("google_write_failed");
      }
    }
  };
}

// src/lib/sheets/edge-entry.ts
Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || secret.length < 32) return new Response("Not configured", { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const required = (key) => {
      const value = Deno.env.get(key);
      if (!value) throw new Error("Missing setting");
      return value;
    };
    const db = createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: activeTherapists, error: therapistError } = await db.from("therapists").select("display_name").eq("is_active", true).order("sort_order", { ascending: true }).order("display_name", { ascending: true });
    if (therapistError) throw new Error("Therapist list unavailable");
    if (!activeTherapists?.length) throw new Error("No active therapists configured");
    const bridge = await createSheetBridge({
      spreadsheetId: required("GOOGLE_SHEETS_SPREADSHEET_ID"),
      tab: required("GOOGLE_SHEETS_TAB"),
      email: required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      privateKey: required("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n"),
      therapistOptions: (activeTherapists ?? []).map((row) => row.display_name.trim()).filter(Boolean)
    });
    const store = {
      async claim() {
        const { data, error } = await db.rpc("claim_appointment_sheet_sync", {});
        if (error) throw new Error("Queue unavailable");
        return data?.[0] ?? null;
      },
      async finish(job, errorCode) {
        const { error } = await db.rpc("finish_appointment_sheet_sync", {
          p_appointment_id: job.appointment_id,
          p_lease_token: job.lease_token,
          p_version: job.version,
          p_error: errorCode
        });
        if (error) throw new Error("Queue acknowledgement failed");
      }
    };
    const result = await processSheetJobs(store, bridge.write);
    const rows = await bridge.readRows();
    const textCell = (value) => value == null ? "" : String(value).trim();
    const ids = rows.map((row) => textCell(row[0])).filter(Boolean);
    let sheetEdits = 0;
    if (ids.length) {
      const { data: records, error } = await db.from("appointments").select("id,guest_name,guest_email,guest_phone,starts_at,ends_at,modality,status,therapist_id,service_id").in("id", ids);
      if (error) throw new Error("Appointment read failed");
      const byId = new Map(records?.map((record) => [record.id, record]) ?? []);
      const [{ data: therapists }, { data: services }] = await Promise.all([
        db.from("therapists").select("id,display_name"),
        db.from("services").select("id,name")
      ]);
      const therapistByName = new Map(therapists?.map((row) => [row.display_name.trim().toLowerCase(), row.id]) ?? []);
      const serviceByName = new Map(services?.map((row) => [row.name.trim().toLowerCase(), row.id]) ?? []);
      for (const row of rows) {
        const id = textCell(row[0]);
        const record = id ? byId.get(id) : void 0;
        if (!record) continue;
        const requested = {
          guest_name: textCell(row[2]) || null,
          guest_email: textCell(row[3]) || null,
          guest_phone: textCell(row[4]) || null,
          therapist_id: textCell(row[5]) ? therapistByName.get(textCell(row[5]).toLowerCase()) : record.therapist_id,
          service_id: textCell(row[6]) ? serviceByName.get(textCell(row[6]).toLowerCase()) : record.service_id,
          starts_at: textCell(row[7]),
          ends_at: textCell(row[8]),
          modality: textCell(row[9]),
          status: textCell(row[10])
        };
        const start = new Date(requested.starts_at);
        const end = new Date(requested.ends_at);
        const validStatus = ["pending", "confirmed", "completed", "cancelled", "no_show"].includes(requested.status);
        const validModality = ["video", "in_person", "phone"].includes(requested.modality);
        const validDates = Number.isFinite(start.valueOf()) && Number.isFinite(end.valueOf()) && end > start;
        const startIso = validDates ? start.toISOString() : "";
        const endIso = validDates ? end.toISOString() : "";
        const changed = requested.guest_name !== (record.guest_name ?? null) || requested.guest_email !== (record.guest_email ?? null) || requested.guest_phone !== (record.guest_phone ?? null) || requested.therapist_id !== record.therapist_id || requested.service_id !== record.service_id || startIso !== new Date(record.starts_at).toISOString() || endIso !== new Date(record.ends_at).toISOString() || requested.modality !== record.modality || requested.status !== record.status;
        if (!changed || !validStatus || !validModality || !validDates || !requested.therapist_id || !requested.service_id) continue;
        const { error: updateError } = await db.from("appointments").update({
          guest_name: requested.guest_name,
          guest_email: requested.guest_email,
          guest_phone: requested.guest_phone,
          starts_at: startIso,
          ends_at: endIso,
          modality: requested.modality,
          status: requested.status,
          therapist_id: requested.therapist_id,
          service_id: requested.service_id
        }).eq("id", id);
        if (updateError) console.error("Sheet edit rejected for appointment", id);
        else sheetEdits++;
      }
    }
    const { data: compactedData, error: compactError } = await db.rpc("compact_appointment_sheet_rows", {});
    if (compactError) throw new Error("Sheet row compaction unavailable");
    const compacted = compactedData ?? [];
    const pendingSnapshotRows = compacted.filter((row) => Number(row.version) > Number(row.synced_version)).map((row) => ({ appointment_id: row.appointment_id, version: Number(row.version) }));
    await bridge.syncSnapshot(
      compacted.map((row) => ({ sheet_row: Number(row.sheet_row), payload: row.payload })),
      rows
    );
    if (pendingSnapshotRows.length) {
      const { error: acknowledgeError } = await db.rpc("finish_appointment_sheet_compaction", {
        p_rows: pendingSnapshotRows
      });
      if (acknowledgeError) throw new Error("Sheet snapshot acknowledgement failed");
    }
    const combined = {
      synced: result.synced + pendingSnapshotRows.length,
      failed: result.failed
    };
    if (sheetEdits) return Response.json({ ...combined, sheetEdits, compacted: compacted.length });
    return Response.json({ ...combined, compacted: compacted.length }, { status: combined.failed ? 503 : 200 });
  } catch {
    console.error("Appointment sync failed; check secrets, sheet access, and queue.");
    return Response.json({ error: "Sync unavailable; queued bookings will retry" }, { status: 503 });
  }
});
