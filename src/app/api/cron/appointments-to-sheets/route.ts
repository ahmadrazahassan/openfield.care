import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { processSheetJobs, type SyncStore } from "@/lib/sheets/core";
import { createSheetWriter, readSheetsConfig } from "@/lib/sheets/google";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) {
    return Response.json({ error: "Sync is not configured" }, { status: 503 });
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = readSheetsConfig();
    const supabase = createAdminClient();
    // Configure Google before claiming anything: bad credentials cannot drain
    // or lose pending work. Errors never include client records or secrets.
    const write = await createSheetWriter(config);
    const store: SyncStore = {
      async claim() {
        const { data, error } = await supabase.rpc("claim_appointment_sheet_sync", {});
        if (error) throw new Error("queue_claim_failed");
        return data?.[0] ?? null;
      },
      async finish(job, failure) {
        const { error } = await supabase.rpc("finish_appointment_sheet_sync", {
          p_appointment_id: job.appointment_id,
          p_lease_token: job.lease_token,
          p_version: job.version,
          p_error: failure,
        });
        if (error) throw new Error("queue_acknowledgement_failed");
      },
    };
    const result = await processSheetJobs(store, write);
    return Response.json(result, { status: result.failed ? 503 : 200 });
  } catch {
    console.error("Appointment sheet sync failed; check configuration and queue status.");
    return Response.json({ error: "Sync unavailable; queued bookings will retry" }, { status: 503 });
  }
}
