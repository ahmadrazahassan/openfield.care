import "server-only";
import { z } from "zod";
export { createSheetWriter } from "./google-client";

const configSchema = z.object({
  spreadsheetId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  tab: z.string().min(1),
  email: z.string().email(),
  privateKey: z.string().includes("BEGIN PRIVATE KEY"),
});

export function readSheetsConfig() {
  return configSchema.parse({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    tab: process.env.GOOGLE_SHEETS_TAB || "Appointments",
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });
}

