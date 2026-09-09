import { timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { createClient } from "@supabase/supabase-js";
import { createSheetBridge } from "./google-client";
import { processSheetJobs, type SheetSnapshotRow, type SyncStore } from "./core";
import type { DatabaseWithSheetsSync } from "../../types/sheets-sync";

// Built into a standalone Supabase Edge Function by build-sheets-edge.mjs.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};

Deno.serve(async request => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || secret.length < 32) return new Response("Not configured", { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const required = (key: string) => {
      const value = Deno.env.get(key);
      if (!value) throw new Error("Missing setting");
      return value;
    };
    // Supabase provides these credentials to its hosted functions automatically.
    const db = createClient<DatabaseWithSheetsSync>(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: activeTherapists, error: therapistError } = await db
      .from("therapists").select("display_name").eq("is_active", true)
      .order("sort_order", { ascending: true }).order("display_name", { ascending: true });
    if (therapistError) throw new Error("Therapist list unavailable");
    if (!activeTherapists?.length) throw new Error("No active therapists configured");
    const bridge = await createSheetBridge({
      spreadsheetId: required("GOOGLE_SHEETS_SPREADSHEET_ID"),
      tab: required("GOOGLE_SHEETS_TAB"),
      email: required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      privateKey: required("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n"),
      therapistOptions: (activeTherapists ?? []).map(row => row.display_name.trim()).filter(Boolean),
    });
    const store: SyncStore = {
      async claim() {
        const { data, error } = await db.rpc("claim_appointment_sheet_sync", {});
        if (error) throw new Error("Queue unavailable");
        return data?.[0] ?? null;
      },
      async finish(job, errorCode) {
        const { error } = await db.rpc("finish_appointment_sheet_sync", {
          p_appointment_id: job.appointment_id, p_lease_token: job.lease_token,
          p_version: job.version, p_error: errorCode,
        });
        if (error) throw new Error("Queue acknowledgement failed");
      },
    };
    const result = await processSheetJobs(store, bridge.write);
    // Google Sheets has no push webhook for ordinary cell edits. Polling the
    // same sheet once per minute makes edits flow back to Supabase automatically
    // while keeping Supabase as the source of truth for generated rows.
    const rows = await bridge.readRows();
    const textCell = (value: unknown) => value == null ? "" : String(value).trim();
    const ids = rows.map(row => textCell(row[0])).filter(Boolean);
    let sheetEdits = 0;
    if (ids.length) {
      const { data: records, error } = await db.from("appointments")
        .select("id,guest_name,guest_email,guest_phone,starts_at,ends_at,modality,status,therapist_id,service_id")
        .in("id", ids);
      if (error) throw new Error("Appointment read failed");
      const byId = new Map(records?.map(record => [record.id, record]) ?? []);
      const [{ data: therapists }, { data: services }] = await Promise.all([
        db.from("therapists").select("id,display_name"),
        db.from("services").select("id,name"),
      ]);
      const therapistByName = new Map(therapists?.map(row => [row.display_name.trim().toLowerCase(), row.id]) ?? []);
      const serviceByName = new Map(services?.map(row => [row.name.trim().toLowerCase(), row.id]) ?? []);
      for (const row of rows) {
        const id = textCell(row[0]);
        const record = id ? byId.get(id) : undefined;
        if (!record) continue;
        const requested = {
          guest_name: textCell(row[2]) || null,
          guest_email: textCell(row[3]) || null,
          guest_phone: textCell(row[4]) || null,
          therapist_id: textCell(row[5]) ? therapistByName.get(textCell(row[5]).toLowerCase()) : record.therapist_id,
          service_id: textCell(row[6]) ? serviceByName.get(textCell(row[6]).toLowerCase()) : record.service_id,
          starts_at: textCell(row[7]), ends_at: textCell(row[8]), modality: textCell(row[9]), status: textCell(row[10]),
        };
        const start = new Date(requested.starts_at);
        const end = new Date(requested.ends_at);
        const validStatus = ["pending", "confirmed", "completed", "cancelled", "no_show"].includes(requested.status);
        const validModality = ["video", "in_person", "phone"].includes(requested.modality);
        const validDates = Number.isFinite(start.valueOf()) && Number.isFinite(end.valueOf()) && end > start;
        const startIso = validDates ? start.toISOString() : "";
        const endIso = validDates ? end.toISOString() : "";
        const changed = requested.guest_name !== (record.guest_name ?? null)
          || requested.guest_email !== (record.guest_email ?? null)
          || requested.guest_phone !== (record.guest_phone ?? null)
          || requested.therapist_id !== record.therapist_id
          || requested.service_id !== record.service_id
          || startIso !== new Date(record.starts_at).toISOString()
          || endIso !== new Date(record.ends_at).toISOString()
          || requested.modality !== record.modality || requested.status !== record.status;
        // Unknown therapist/service names are rejected as one atomic row edit.
        if (!changed || !validStatus || !validModality || !validDates
          || !requested.therapist_id || !requested.service_id) continue;
        const { error: updateError } = await db.from("appointments").update({
          guest_name: requested.guest_name, guest_email: requested.guest_email,
          guest_phone: requested.guest_phone, starts_at: startIso,
          ends_at: endIso, modality: requested.modality as never,
          status: requested.status as never,
          therapist_id: requested.therapist_id, service_id: requested.service_id,
        }).eq("id", id);
        if (updateError) console.error("Sheet edit rejected for appointment", id);
        else sheetEdits++;
      }
    }
    // Reassign every appointment to the next contiguous row, preserving the
    // existing order. This also lets the sheet be the clean, client-facing
    // view even after rows were deleted or skipped manually.
    const { data: compactedData, error: compactError } = await db
      .rpc("compact_appointment_sheet_rows", {});
    if (compactError) throw new Error("Sheet row compaction unavailable");
    const compacted = (compactedData ?? []) as SheetSnapshotRow[];
    const pendingSnapshotRows = compacted
      .filter(row => Number(row.version) > Number(row.synced_version))
      .map(row => ({ appointment_id: row.appointment_id, version: Number(row.version) }));
    await bridge.syncSnapshot(
      compacted.map(row => ({ sheet_row: Number(row.sheet_row), payload: row.payload })),
      rows,
    );
    if (pendingSnapshotRows.length) {
      const { error: acknowledgeError } = await db.rpc("finish_appointment_sheet_compaction", {
        p_rows: pendingSnapshotRows,
      });
      if (acknowledgeError) throw new Error("Sheet snapshot acknowledgement failed");
    }
    const combined = {
      synced: result.synced + pendingSnapshotRows.length,
      failed: result.failed,
    };
    if (sheetEdits) return Response.json({ ...combined, sheetEdits, compacted: compacted.length });
    return Response.json({ ...combined, compacted: compacted.length }, { status: combined.failed ? 503 : 200 });
  } catch {
    console.error("Appointment sync failed; check secrets, sheet access, and queue.");
    return Response.json({ error: "Sync unavailable; queued bookings will retry" }, { status: 503 });
  }
});
