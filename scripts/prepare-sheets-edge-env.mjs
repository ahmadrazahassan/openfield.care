import { writeFileSync, mkdirSync } from "node:fs";

// Run with node --env-file=.env.local. Only integration-specific settings are
// exported; Supabase injects its own built-in credentials in the cloud.
const names = ["GOOGLE_SHEETS_SPREADSHEET_ID", "GOOGLE_SHEETS_TAB",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "CRON_SECRET"];
if (names.some(name => !process.env[name])) throw new Error("Missing integration settings");
mkdirSync("supabase/.temp", { recursive: true });
writeFileSync("supabase/.temp/.env.sheets", names.map(name => `${name}=${JSON.stringify(process.env[name])}`).join("\n") + "\n");
console.log("Prepared private integration environment file; values not displayed.");
