# Automatic appointment copying

The app saves bookings in Supabase and a scheduled worker keeps the restricted
Google Sheet in sync in both directions. New bookings and database changes are
written to the sheet. Edits to a booking row in the sheet are read back and
applied to Supabase on the next one-minute run. No staff member needs to copy or
paste a booking.

## Current connection

Target: https://docs.google.com/spreadsheets/d/1LSSx5S9W-761ZHTYYmwFJjCemJvLQ_1jIujpxE0rcQg/edit

The local configuration targets the existing `Sheet1` tab. Its column headings
have been added. Supabase and Google credentials are configured in `.env.local`.
The Google service account is
`mental-health@mental-health-508021.iam.gserviceaccount.com`.
The Google Sheets API is enabled and the account has Editor access to the
restricted spreadsheet. The queue, hosted worker, and one-minute schedule are
now active in Supabase project `uxjfzgkllqjqsdhnmiwa`.
The sheet was accessible without signing in during setup. Change its General
access to **Restricted** before sending any client records.

The Status and Therapist columns use Google Sheets dropdown validation only on
rows that contain an appointment. Empty rows have no dropdown arrows. The
status choices are `pending`, `confirmed`, `completed`, `cancelled`, and
`no_show`; therapist choices are loaded from the active Supabase therapists.
Reapply them after adding a new therapist with:

```powershell
npm run sheets:dropdowns
```

## One-time activation

1. In Google Cloud, enable the **Google Sheets API** and create a service account
   and JSON key. Share only this spreadsheet with that account's email as
   **Editor**. No domain-wide delegation or project IAM role is needed.
2. Set these server environment variables locally and in the deployed website:
   - `SUPABASE_SERVICE_ROLE_KEY`: from the existing Supabase project.
   - `GOOGLE_SHEETS_SPREADSHEET_ID`: `1LSSx5S9W-761ZHTYYmwFJjCemJvLQ_1jIujpxE0rcQg`
   - `GOOGLE_SHEETS_TAB`: `Sheet1`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: the JSON's `client_email`.
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: the JSON's `private_key`.
   - `CRON_SECRET`: a random secret of at least 32 characters.
   Keep these in environment settings, never in the browser or committed files.
3. The migration has been applied to the existing project. It depends on the
   existing appointments, profiles, therapists, and services tables. It does
   not replace booking logic, alter access policies on bookings, or export
   historical rows.
4. The Supabase Edge Function `appointments-to-sheets` is deployed at
   `https://uxjfzgkllqjqsdhnmiwa.supabase.co/functions/v1/appointments-to-sheets`.
   It is authenticated by `CRON_SECRET` and returns only counts or a generic
   error, never records.
5. Supabase Cron and pg_net are enabled, the two Vault secrets are configured,
   and the one-minute schedule is active:
   - `appointment_sheet_sync_url`: the full deployed HTTPS endpoint above.
   - `appointment_sheet_sync_secret`: the same `CRON_SECRET`.
   The schedule calls the hosted function; it does not depend on your local
   computer or localhost.
6. A hosted smoke test succeeded: one queued appointment was written to the
   spreadsheet and acknowledged as synced. The queue is currently clear.

## How the automation behaves

- New bookings, including pending bookings, copy with their current status.
  Confirmation, rescheduling, cancellation, completion, contact fields,
  therapist, service, and session type update that row in both directions.
- Sheet edits to columns C:K are read on each run and applied to Supabase. These
  are name, email, phone, therapist, service, start/end time, session type, and
  status. Columns A:B (ID and booking reference) and L:N (price, currency, and
  generated timestamp) stay system-managed. The appointment ID in column A is
  the link between the two systems. Invalid dates, statuses, modalities, or
  unknown therapist/service names are ignored safely.
- Supabase remains the authoritative record after a conflict. Once a valid Sheet
  edit is accepted, the resulting database change is written back to that same
  row on the following run.
- Each appointment has a managed spreadsheet row. Timeouts and retries write
  that same row to prevent duplicate bookings in Sheets. After every sync, the
  worker compacts appointments into rows 2, 3, 4, and so on, preserving their
  current order. This removes gaps left by deleted or skipped rows and makes
  the next booking use the next available row.
- Keep `Sheet1` as the integration's raw data tab. Do not insert/delete/reorder
  its rows or physically sort them; use filter views or a separate report tab.
  The worker manages headers, capacity, compaction, and dropdown ranges
  automatically. Columns O:P contain system IDs and are hidden; leave them
  hidden and unchanged.
- A Google outage cannot interrupt a saved booking. The durable queue retries
  with backoff, up to one hour between attempts. Crashed jobs become available
  after five minutes. The worker processes up to ten records per request.
- Therapy notes, intake answers, meeting links, and cancellation reasons are
  excluded. Names/contact details and scheduling data are included. Times are UTC.
- Hard database deletion is not mirrored to Sheets. For privacy erasure, remove
  the exported record as well; normal cancellation uses the status update.
- This targets one spreadsheet/tab. To move the integration, perform a planned
  re-sync; changing only the destination does not backfill already-synced rows.

## Verify and monitor

Run `npm run test:sheets`, `npx tsc --noEmit`, and the scoped lint check before
deployment. Tests use a disposable local PostgreSQL-compatible database and
synthetic records; they never call Google or production Supabase.

Import a downloaded Google service-account key without displaying it:

```powershell
node scripts/configure-google-sheets.mjs 'C:\path\to\service-account.json'
```

Verify Google authentication and sheet write access (refreshes only headings):

```powershell
node --env-file=.env.local --conditions=react-server --import=tsx scripts/check-sheets-connection.ts
```

Use this query as the database administrator to inspect sync health without
returning names or contact details:

```sql
select count(*) filter (where version > synced_version) as waiting,
       count(*) filter (where last_error is not null) as retrying,
       max(synced_at) as last_success
from public.appointment_sheet_sync;
```

Check Supabase Cron history and pg_net responses for failed runs. A 401 means
the scheduler secret differs from the deployed secret. A 503 means credentials,
sheet access, the migration, or a downstream service needs attention. Google
setup failures leave all work queued. Alert on repeated failures or an old
pending queue in the production monitoring system.

## Official references

- [Google service-account authentication](https://developers.google.com/identity/protocols/oauth2/service-account)
- [Google Sheets value updates](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/update)
- [Supabase scheduled HTTP calls and Vault](https://supabase.com/docs/guides/functions/schedule-functions)
