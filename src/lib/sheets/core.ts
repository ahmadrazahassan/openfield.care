export type SheetBooking = {
  id: string; reference: string; name: string; email: string; phone: string;
  therapist: string; service: string; starts_at: string; ends_at: string;
  modality: string; status: string; price_cents: number; currency: string;
  updated_at: string; therapist_id: string; service_id: string;
};

export type SyncJob = {
  appointment_id: string; sheet_row: number; version: number;
  lease_token: string; payload: SheetBooking;
};

export type SheetSnapshotRow = {
  appointment_id: string; sheet_row: number; version: number;
  synced_version: number; payload: SheetBooking;
};

export const SHEET_HEADERS = [
  "Appointment ID", "Booking reference", "Client name", "Email", "Phone",
  "Therapist", "Service", "Starts at (UTC)", "Ends at (UTC)",
  "Session type", "Status", "Price", "Currency", "Updated at (UTC)",
  "Therapist ID (system)", "Service ID (system)",
];

export function sheetValues(b: SheetBooking): (string | number)[] {
  return [b.id, b.reference, b.name, b.email, b.phone, b.therapist,
    b.service, b.starts_at, b.ends_at, b.modality, b.status,
    b.price_cents / 100, b.currency, b.updated_at, b.therapist_id, b.service_id];
}

export function sheetRange(tab: string, row: number) {
  if (!Number.isSafeInteger(row) || row < 1) throw new Error("Invalid sheet row");
  return `'${tab.replaceAll("'", "''")}'!A${row}:P${row}`;
}

export interface SyncStore {
  claim(): Promise<SyncJob | null>;
  finish(job: SyncJob, error: string | null): Promise<void>;
}

// No client details or Google response bodies are persisted in error logs.
export class SheetSyncError extends Error {
  constructor(public readonly code: string) { super(code); }
}

export async function processSheetJobs(
  store: SyncStore, write: (job: SyncJob) => Promise<void>,
  options = { limit: 10, budgetMs: 35_000 },
) {
  const started = Date.now();
  const result = { synced: 0, failed: 0 };
  for (let i = 0; i < options.limit && Date.now() - started < options.budgetMs; i++) {
    const job = await store.claim();
    if (!job) break;
    let error: string | null = null;
    try { await write(job); }
    catch (cause) {
      error = cause instanceof SheetSyncError ? cause.code : "sheet_write_failed";
    }
    // A failed acknowledgement throws; the lease then makes the job retryable.
    await store.finish(job, error);
    if (error) { result.failed++; break; }
    result.synced++;
  }
  return result;
}
