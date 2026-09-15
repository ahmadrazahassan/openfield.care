# Appointment email delivery

Appointments now use a Supabase outbox. The database trigger adds an email job
inside the same transaction as a booking or status change. The hosted
`send-appointment-email` Edge Function is woken the moment a job is queued
(pg_net, after commit) and also runs every minute as a safety net. It claims jobs with a
lease, sends the branded message through Resend, and marks it sent. A provider
outage leaves the job queued and retries it with backoff; a booking is never
lost because email was temporarily unavailable.

The following events are sent automatically:

- New booking: confirmation (bookings are confirmed immediately on booking)
- Status changed to `confirmed`: appointment confirmation
- Time, therapist, service, or format changed: rescheduled details
- Status changed to `cancelled`: cancellation notice
- **24 hours before**: reminder (not sent if the booking was made inside that window)
- **1 hour before**: "starting soon" reminder

Reminders are queued by `enqueue_due_appointment_reminders()` on the
`appointment-email-reminders` cron (every minute) and delivered by the same
worker. Each reminder records the start time it was for (`scheduled_for`): a
unique index allows one of each per booking *per start time*, so a rescheduled
session gets fresh reminders and a queued reminder for the old time is skipped.
A 24-hour reminder that slips inside the last 2 hours is skipped too.

Measured end to end (September 2026): booking, reschedule and cancellation
emails reach Resend about 1 second after the change; reminders go out within
5 seconds of their minute.

Delivery states: `pending` → `sending` → `sent`. A permanent failure parks as
`failed` after 8 attempts (about 1.5 hours of backoff) instead of retrying
forever. A job that stops being true before it sends — the booking was
cancelled, or the session already started — is marked `skipped`.

Each non-cancellation message includes an `.ics` calendar attachment. The
worker reads the recipient from the booking, and only the service role can read
or modify the private outbox.

## One-time provider setup

Supabase's built-in SMTP settings are for Supabase Auth messages. Appointment
mail is application transactional mail, so the worker uses Resend. Create a
Resend API key and verify the domain used by `RESEND_FROM_EMAIL`, then set the
server-only secret:

```powershell
npx supabase secrets set --project-ref uxjfzgkllqjqsdhnmiwa `
  'RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx' `
  'SITE_URL=https://openuproom.com' `
  'RESEND_FROM_EMAIL=Open Up Room <hello@openuproom.com>'
```

The migration, function deployment, and `appointment-email-sync` cron job are
already installed in project `uxjfzgkllqjqsdhnmiwa`. After the key is set, a
new booking queues immediately and the first delivery normally occurs within
one minute. A temporary failure is retried at 30 seconds, 60 seconds, 2
minutes, and so on up to one hour between attempts.

To inspect delivery state in Supabase SQL Editor:

```sql
select event_type, recipient_email, status, attempts, last_error, created_at, sent_at
from public.appointment_email_outbox
order by created_at desc;
```

The web app does not need to be running for delivery; Supabase hosts the queue
worker. Keep `RESEND_API_KEY` out of the browser and out of `NEXT_PUBLIC_*`
variables.
