import { GoogleAuth } from "google-auth-library";

type SheetProperties = {
  sheetId: number;
  title: string;
  gridProperties: { rowCount: number; columnCount: number };
};

async function main() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const tab = process.env.GOOGLE_SHEETS_TAB || "Sheet1";
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!spreadsheetId || !serviceAccountEmail || !privateKey || !supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Google or Supabase server environment settings");
  }

  const auth = new GoogleAuth({
    credentials: { client_email: serviceAccountEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const client = await auth.getClient();
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

  const metadata = await client.request<{ sheets: { properties: SheetProperties }[] }>({
    url: base,
    params: { fields: "sheets.properties" },
  });
  const sheet = metadata.data.sheets.find(({ properties }) => properties.title === tab)?.properties;
  if (!sheet) throw new Error(`Could not find the ${tab} tab`);

  const response = await fetch(
    `${supabaseUrl}/rest/v1/therapists?select=display_name&is_active=eq.true&order=sort_order.asc,display_name.asc`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } },
  );
  if (!response.ok) throw new Error("Could not load active therapists from Supabase");
  const therapists = (await response.json() as { display_name: string }[])
    .map(({ display_name }) => display_name.trim())
    .filter(Boolean);
  if (!therapists.length) throw new Error("No active therapists found");

  const valuesResponse = await client.request<{ values?: (string | number)[][] }>({
    url: `${base}/values/${encodeURIComponent(`'${tab.replaceAll("'", "''")}'!A2:P1001`)}`,
    params: { majorDimension: "ROWS", valueRenderOption: "UNFORMATTED_VALUE" },
  });
  const values = valuesResponse.data.values ?? [];
  const lastDataIndex = values.reduce((last, row, index) =>
    row.some(value => String(value ?? "").trim() !== "") ? index : last, -1);
  const lastRow = lastDataIndex >= 0 ? lastDataIndex + 2 : 1;

  const listRule = (values: string[]) => ({
    condition: {
      type: "ONE_OF_LIST",
      values: values.map(userEnteredValue => ({ userEnteredValue })),
    },
    strict: true,
    showCustomUi: true,
  });

  await client.request({
    url: `${base}:batchUpdate`,
    method: "POST",
    data: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: 1,
              endRowIndex: Math.max(2, sheet.gridProperties.rowCount),
              startColumnIndex: 5,
              endColumnIndex: 6,
            },
            rule: null,
          },
        },
        {
          setDataValidation: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: 1,
              endRowIndex: Math.max(2, sheet.gridProperties.rowCount),
              startColumnIndex: 10,
              endColumnIndex: 11,
            },
            rule: null,
          },
        },
        ...(lastRow < 2 ? [] : [
        {
          setDataValidation: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: 1,
              endRowIndex: lastRow,
              startColumnIndex: 5,
              endColumnIndex: 6,
            },
            rule: listRule(therapists),
          },
        },
        {
          setDataValidation: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: 1,
              endRowIndex: lastRow,
              startColumnIndex: 10,
              endColumnIndex: 11,
            },
            rule: listRule(["pending", "confirmed", "completed", "cancelled", "no_show"]),
          },
        },
        ]),
      ],
    },
  });

  console.log(`Dropdowns added to ${tab}: status (5 options), therapist (${therapists.length} active therapists), rows 2-${lastRow}.`);
}

void main().catch(error => {
  console.error(error instanceof Error ? error.message : "Could not configure the sheet dropdowns");
  process.exitCode = 1;
});
