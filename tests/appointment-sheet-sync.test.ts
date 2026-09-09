import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { processSheetJobs, sheetRange, sheetValues, SHEET_HEADERS, type SyncJob } from "../src/lib/sheets/core";

test("queue survives failures, tracks concurrent edits, and isolates client access", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      grant usage on schema public to anon, authenticated, service_role;
      create table public.profiles(id uuid primary key, full_name text, email text, phone text);
      create table public.therapists(id uuid primary key, display_name text);
      create table public.services(id uuid primary key, name text);
      create table public.appointments(
        id uuid primary key, reference text, client_id uuid, guest_name text,
        guest_email text, guest_phone text, therapist_id uuid, service_id uuid,
        starts_at timestamptz, ends_at timestamptz, modality text, status text,
        price_cents int, currency text, updated_at timestamptz default now(),
        client_note text, intake jsonb
      );
      insert into therapists values ('00000000-0000-4000-8000-000000000001', 'Test therapist');
      insert into services values ('00000000-0000-4000-8000-000000000002', 'Test consultation');
    `);
    await db.exec(readFileSync("supabase/migrations/202609090001_appointment_sheet_sync.sql", "utf8"));
    await db.exec(readFileSync("supabase/migrations/202609090003_appointment_sheet_compaction.sql", "utf8"));
    const insert = `insert into appointments(id,reference,guest_name,guest_email,therapist_id,service_id,starts_at,ends_at,modality,status,price_cents,currency,client_note,intake)
      values('00000000-0000-4000-8000-000000000003','TEST-001','=1+1','test@example.invalid',
      '00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002',
      '2026-09-10T10:00:00Z','2026-09-10T10:50:00Z','video','confirmed',9000,'GBP','PRIVATE NOTE','{"private":"intake"}');`;
    await db.exec(`begin; ${insert} rollback;`);
    assert.equal((await db.query("select * from appointment_sheet_sync")).rows.length, 0, "rolled-back bookings cannot sync");
    await db.exec(insert);
    const claim = async () => (await db.query<SyncJob>("select * from claim_appointment_sheet_sync()")).rows[0];
    const finish = async (j: SyncJob, error: string | null) => {
      await db.query("select finish_appointment_sheet_sync($1,$2,$3,$4)", [j.appointment_id,j.lease_token,j.version,error]);
    };
    const first = await claim();
    assert.equal(first.payload.status, "confirmed");
    assert(!JSON.stringify(first.payload).includes("PRIVATE NOTE"));
    assert(!("intake" in first.payload));
    assert.equal(await claim(), undefined, "a second worker cannot claim a leased job");
    await db.exec("update appointments set status = 'cancelled'");
    await finish(first, null);
    const changed = await claim();
    assert.equal(changed.sheet_row, first.sheet_row, "cancellation reuses the same row");
    assert.equal(changed.payload.status, "cancelled");
    assert.equal(Number(changed.version), Number(first.version) + 1, "an edit during sync is not lost");
    await finish(changed, "google_write_failed");
    assert.equal(await claim(), undefined, "a failed write backs off");
    await db.exec("update appointment_sheet_sync set retry_at = now() - interval '1 second'");
    const retry = await claim();
    assert.equal(retry.sheet_row, first.sheet_row);
    await db.exec("update appointment_sheet_sync set lease_until = now() - interval '1 second'");
    const recovered = await claim();
    assert.notEqual(recovered.lease_token, retry.lease_token);
    await finish(retry, null);
    assert.equal(await claim(), undefined, "a stale acknowledgement cannot release the new lease");
    await finish(recovered, null);
    assert.equal(await claim(), undefined, "success clears pending work");

    await db.exec(`insert into appointments(id,reference,guest_name,guest_email,therapist_id,service_id,starts_at,ends_at,modality,status,price_cents,currency)
      values
      ('00000000-0000-4000-8000-000000000004','TEST-002','Second','second@example.invalid','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','2026-09-11T10:00:00Z','2026-09-11T10:50:00Z','video','pending',9000,'GBP'),
      ('00000000-0000-4000-8000-000000000005','TEST-003','Third','third@example.invalid','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','2026-09-12T10:00:00Z','2026-09-12T10:50:00Z','video','pending',9000,'GBP');
      delete from appointments where id = '00000000-0000-4000-8000-000000000004';`);
    const beforeCompact = (await db.query<{ sheet_row: number }>("select sheet_row from appointment_sheet_sync order by sheet_row")).rows;
    const beforeRows = beforeCompact.map(row => Number(row.sheet_row));
    assert.equal(beforeRows.length, 2);
    assert(beforeRows[1] > beforeRows[0] + 1, "deleting a booking leaves a physical gap");
    const compacted = (await db.query<{ appointment_id: string; sheet_row: number; version: number }>("select appointment_id, sheet_row, version from compact_appointment_sheet_rows() order by sheet_row")).rows;
    assert.deepEqual(compacted.map(row => Number(row.sheet_row)), [2, 3], "compaction assigns the next contiguous rows");
    await db.query("select finish_appointment_sheet_compaction($1)", [JSON.stringify(compacted.map(row => ({ appointment_id: row.appointment_id, version: Number(row.version) })))]);
    assert.equal(await claim(), undefined, "compacted rows are acknowledged");
    await db.exec("set role anon");
    await assert.rejects(() => db.query("select * from appointment_sheet_sync"), /permission denied/);
    await assert.rejects(() => db.query("select * from claim_appointment_sheet_sync()"), /permission denied/);
    await db.exec("reset role; set role service_role");
    assert.equal((await db.query("select * from claim_appointment_sheet_sync()")).rows.length, 0);
  } finally { await db.close(); }
});

const job: SyncJob = {
  appointment_id: "test", sheet_row: 2, version: 1, lease_token: "lease",
  payload: { id: "test", reference: "TEST", name: "=1+1", email: "test@example.invalid", phone: "+123",
    therapist: "Therapist", service: "Consultation", starts_at: "2026-09-10T10:00:00Z",
    ends_at: "2026-09-10T10:50:00Z", modality: "video", status: "confirmed", price_cents: 9000,
    currency: "GBP", updated_at: "2026-09-09T10:00:00Z",
    therapist_id: "therapist", service_id: "service" },
};

test("ambiguous Google success retries without creating a second row", async () => {
  const rows = new Map<number, (string | number)[]>();
  let pending = true;
  const failures: (string | null)[] = [];
  const store = {
    async claim() { return pending ? job : null; },
    async finish(_job: SyncJob, error: string | null) { failures.push(error); pending = error !== null; },
  };
  const failed = await processSheetJobs(store, async j => {
    rows.set(j.sheet_row, sheetValues(j.payload));
    throw new Error("Response lost after Google saved it: private details");
  });
  assert.deepEqual(failed, { synced: 0, failed: 1 });
  assert.deepEqual(failures, ["sheet_write_failed"]);
  const success = await processSheetJobs(store, async j => { rows.set(j.sheet_row, sheetValues(j.payload)); });
  assert.deepEqual(success, { synced: 1, failed: 0 });
  assert.equal(rows.size, 1);
  assert.equal(rows.get(2)?.length, SHEET_HEADERS.length);
});

test("database acknowledgement failure cannot be reported as success", async () => {
  await assert.rejects(() => processSheetJobs({
    async claim() { return job; },
    async finish() { throw new Error("database unavailable"); },
  }, async () => {}), /database unavailable/);
});

test("sheet tab names are escaped and invalid row targets are rejected", () => {
  assert.equal(sheetRange("Client's bookings", 2), "'Client''s bookings'!A2:P2");
  assert.throws(() => sheetRange("Appointments", 0));
  assert.throws(() => sheetRange("Appointments", 1.5));
});
