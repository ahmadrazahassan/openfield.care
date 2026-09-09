import { GoogleAuth } from "google-auth-library";

async function main() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const tab = process.env.GOOGLE_SHEETS_TAB || "Sheet1";
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!spreadsheetId || !email || !privateKey) throw new Error("Missing Google environment settings");
  const auth = new GoogleAuth({ credentials: { client_email: email, private_key: privateKey }, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  const client = await auth.getClient();
  const result = await client.request<{ sheets?: { data?: { rowData?: { values?: { dataValidation?: { condition?: { type?: string; values?: { userEnteredValue?: string }[] } } }[] }[] }[] }[] }>({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    params: {
      includeGridData: true,
      ranges: [`'${tab.replaceAll("'", "''")}'!F2:K2`],
      fields: "sheets(data.rowData.values.dataValidation)",
    },
  });
  const validations = result.data.sheets?.flatMap(sheet => sheet.data?.flatMap(data => data.rowData?.flatMap(row => row.values?.map(value => value.dataValidation))) ?? []) ?? [];
  console.log(JSON.stringify(validations.map(validation => ({
    type: validation?.condition?.type,
    values: validation?.condition?.values?.map(value => value.userEnteredValue),
  }))));
}

void main().catch(error => {
  console.error(error instanceof Error ? error.message : "Could not verify dropdowns");
  process.exitCode = 1;
});
