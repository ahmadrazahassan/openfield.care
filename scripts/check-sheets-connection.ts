import { createSheetWriter, readSheetsConfig } from "../src/lib/sheets/google";

// Run with Node --env-file=.env.local --conditions=react-server --import=tsx.
// Checks read/write access by refreshing headers only, without client records.
async function main() {
  try {
    await createSheetWriter(readSheetsConfig());
    console.log("Google Sheets connection verified: tab found and headers written.");
  } catch (error) {
    const safe = error as { code?: unknown; response?: { status?: number; data?: {
      error?: { status?: string; details?: { reason?: string }[] };
    } } };
    console.error(JSON.stringify({
      check: "Google Sheets connection failed",
      status: safe.response?.status,
      reason: safe.response?.data?.error?.status,
      details: safe.response?.data?.error?.details?.map(d => d.reason).filter(Boolean),
    }));
    process.exitCode = 1;
  }
}
void main();
