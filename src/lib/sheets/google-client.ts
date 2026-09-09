import { GoogleAuth } from "google-auth-library";
import { SHEET_HEADERS, SheetSyncError, sheetRange, sheetValues, type SheetBooking, type SyncJob } from "./core";

export type SheetsConfig = {
  spreadsheetId: string;
  tab: string;
  email: string;
  privateKey: string;
  therapistOptions?: string[];
};

export type SheetBridge = {
  write(job: SyncJob): Promise<void>;
  readRows(): Promise<string[][]>;
  syncSnapshot(rows: Array<{ sheet_row: number; payload: SheetBooking }>, currentRows: string[][]): Promise<void>;
};

export async function createSheetBridge(config: SheetsConfig): Promise<SheetBridge> {
  const auth = new GoogleAuth({
    credentials: { client_email: config.email, private_key: config.privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    clientOptions: { transporterOptions: { timeout: 10_000, retry: false } },
  });
  const client = await auth.getClient();
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}`;
  const metadata = await client.request<{
    sheets: { properties: { sheetId: number; title: string; gridProperties: { rowCount: number; columnCount: number } } }[];
  }>({ url: base, params: { fields: "sheets.properties" }, timeout: 10_000, retry: false });
  const sheet = metadata.data.sheets.find(s => s.properties.title === config.tab)?.properties;
  if (!sheet) throw new SheetSyncError("sheet_tab_missing");

  async function ensureCapacity(row: number) {
    if (sheet!.gridProperties.rowCount >= row && sheet!.gridProperties.columnCount >= 16) return;
    const rowCount = Math.max(row + 100, sheet!.gridProperties.rowCount);
    const columnCount = Math.max(16, sheet!.gridProperties.columnCount);
    const requests = [];
    if (rowCount > sheet!.gridProperties.rowCount) requests.push({ appendDimension: {
      sheetId: sheet!.sheetId, dimension: "ROWS", length: rowCount - sheet!.gridProperties.rowCount,
    } });
    if (columnCount > sheet!.gridProperties.columnCount) requests.push({ appendDimension: {
      sheetId: sheet!.sheetId, dimension: "COLUMNS", length: columnCount - sheet!.gridProperties.columnCount,
    } });
    // Appending cannot truncate another worker's writes if requests overlap.
    await client.request({ url: `${base}:batchUpdate`, method: "POST", timeout: 10_000, retry: false,
      data: { requests },
    });
    sheet!.gridProperties = { rowCount, columnCount };
  }

  async function put(row: number, values: (string | number)[]) {
    await client.request({
      url: `${base}/values/${encodeURIComponent(sheetRange(config.tab, row))}`,
      method: "PUT", params: { valueInputOption: "RAW" },
      data: { majorDimension: "ROWS", values: [values] },
      timeout: 10_000, retry: false,
    });
  }

  const textValue = (value: string | number | undefined) => value == null ? "" : String(value);

  function valuesMatch(current: string[], expected: (string | number)[]) {
    return expected.every((value, index) => textValue(current[index]) === textValue(value));
  }

  async function updateDropdowns(lastRow: number) {
    const allRowsEnd = Math.max(2, sheet!.gridProperties.rowCount);
    const requests: Record<string, unknown>[] = [{ setDataValidation: {
      range: { sheetId: sheet!.sheetId, startRowIndex: 1, endRowIndex: allRowsEnd, startColumnIndex: 10, endColumnIndex: 11 },
      rule: null,
    } }];
    if (config.therapistOptions) requests.unshift({ setDataValidation: {
      range: { sheetId: sheet!.sheetId, startRowIndex: 1, endRowIndex: allRowsEnd, startColumnIndex: 5, endColumnIndex: 6 },
      rule: null,
    } });
    const listRule = (values: string[]) => ({
      condition: { type: "ONE_OF_LIST", values: values.map(userEnteredValue => ({ userEnteredValue })) },
      strict: true,
      showCustomUi: true,
    });
    if (lastRow >= 2) {
      if (config.therapistOptions?.length) requests.push({ setDataValidation: {
        range: { sheetId: sheet!.sheetId, startRowIndex: 1, endRowIndex: lastRow, startColumnIndex: 5, endColumnIndex: 6 },
        rule: listRule(config.therapistOptions),
      } });
      requests.push({ setDataValidation: {
        range: { sheetId: sheet!.sheetId, startRowIndex: 1, endRowIndex: lastRow, startColumnIndex: 10, endColumnIndex: 11 },
        rule: listRule(["pending", "confirmed", "completed", "cancelled", "no_show"]),
      } });
    }
    await client.request({ url: `${base}:batchUpdate`, method: "POST", timeout: 10_000, retry: false,
      data: { requests },
    });
  }

  async function clearRows(startRow: number) {
    const endRow = sheet!.gridProperties.rowCount;
    if (startRow > endRow) return;
    await client.request({
      url: `${base}/values/${encodeURIComponent(`'${config.tab.replaceAll("'", "''")}'!A${startRow}:P${endRow}`)}:clear`,
      method: "POST", data: {}, timeout: 10_000, retry: false,
    });
  }

  async function replaceRows(rows: Array<{ sheet_row: number; payload: SheetBooking }>) {
    const lastRow = rows.length ? rows[rows.length - 1].sheet_row : 1;
    await ensureCapacity(Math.max(1, lastRow));
    if (rows.length) {
      await client.request({
        url: `${base}/values:batchUpdate`, method: "POST",
        params: { valueInputOption: "RAW" },
        data: {
          valueInputOption: "RAW",
          data: rows.map(({ sheet_row, payload }) => ({
            range: sheetRange(config.tab, sheet_row),
            majorDimension: "ROWS",
            values: [sheetValues(payload)],
          })),
        },
        timeout: 10_000, retry: false,
      });
    }
    await clearRows(lastRow + 1);
    await updateDropdowns(lastRow);
  }
  async function readRows() {
    try {
      const response = await client.request<{ values?: string[][] }>({
        url: `${base}/values/${encodeURIComponent(`'${config.tab.replaceAll("'", "''")}'!A2:P1001`)}`,
        params: { majorDimension: "ROWS", valueRenderOption: "UNFORMATTED_VALUE" },
        timeout: 10_000, retry: false,
      });
      return response.data.values ?? [];
    } catch {
      throw new SheetSyncError("google_read_failed");
    }
  }
  async function hideSystemColumns() {
    await client.request({ url: `${base}:batchUpdate`, method: "POST", timeout: 10_000, retry: false,
      data: { requests: [{ updateDimensionProperties: {
        range: { sheetId: sheet!.sheetId, dimension: "COLUMNS", startIndex: 14, endIndex: 16 },
        properties: { hiddenByUser: true }, fields: "hiddenByUser",
      } }] },
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
      const unchanged = currentRows.length === expected.length
        && expected.every((values, index) => valuesMatch(currentRows[index], values));
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
    async write(job: SyncJob) {
    try {
      await ensureCapacity(job.sheet_row);
      // Stable database-assigned rows make retries safe even after an ambiguous
      // network timeout: overwrite the same row, never append another copy.
      await put(job.sheet_row, sheetValues(job.payload));
    } catch {
      throw new SheetSyncError("google_write_failed");
    }
    },
  };
}

export async function createSheetWriter(config: SheetsConfig) {
  const bridge = await createSheetBridge(config);
  return bridge.write;
}
