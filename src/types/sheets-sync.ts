import type { Database } from "./database.types";
import type { SheetSnapshotRow, SyncJob } from "../lib/sheets/core";

// Temporary additive types until the migration is applied and DB types regenerated.
export type DatabaseWithSheetsSync = Database & {
  public: { Functions: {
    claim_appointment_sheet_sync: { Args: Record<string, never>; Returns: SyncJob[] };
    finish_appointment_sheet_sync: {
      Args: { p_appointment_id: string; p_lease_token: string; p_version: number; p_error: string | null };
      Returns: undefined;
    };
    compact_appointment_sheet_rows: { Args: Record<string, never>; Returns: SheetSnapshotRow[] };
    finish_appointment_sheet_compaction: {
      Args: { p_rows: Array<{ appointment_id: string; version: number }> };
      Returns: undefined;
    };
  } };
};
