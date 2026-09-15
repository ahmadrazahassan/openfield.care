-- Appointment emails: send on time, and never for a time that has changed.
--
-- 1. Reminders remember which start time they were for (scheduled_for).
--    A reschedule gets fresh reminders; a queued reminder for the old time is
--    skipped instead of telling someone "see you tomorrow" for last week's slot.
-- 2. Reminder windows are checked every minute, so "in an hour" means 60 to 61
--    minutes, not 70 to 75.
-- 3. The worker is woken the moment an email is queued (pg_net fires after the
--    transaction commits), so booking emails no longer wait for the next tick.
--    The every-minute cron stays as the safety net.

alter table public.appointment_email_outbox
  add column if not exists scheduled_for timestamptz;

drop index if exists public.appointment_email_outbox_reminder_once;
create unique index appointment_email_outbox_reminder_once
  on public.appointment_email_outbox (appointment_id, event_type, scheduled_for)
  where event_type in ('reminder_24h', 'reminder_1h');

-- Wake the worker. Best effort: a failure here must never block a booking.
create or replace function private.kick_appointment_email_worker()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_secret text;
begin
  select decrypted_secret into v_url
  from vault.decrypted_secrets where name = 'appointment_email_sync_url';
  select decrypted_secret into v_secret
  from vault.decrypted_secrets where name = 'appointment_sheet_sync_secret';
  if v_url is null or v_secret is null then
    return;
  end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body := '{}'::jsonb
  );
exception when others then
  return;
end;
$$;

revoke all on function private.kick_appointment_email_worker() from public, anon, authenticated;

create or replace function public.enqueue_appointment_email(
  p_appointment_id uuid, p_event_type text, p_recipient_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_recipient_email is null or btrim(p_recipient_email) = '' then
    return;
  end if;

  insert into public.appointment_email_outbox (appointment_id, event_type, recipient_email)
  values (p_appointment_id, p_event_type, lower(btrim(p_recipient_email)));

  perform private.kick_appointment_email_worker();
end;
$$;

create or replace function public.enqueue_due_appointment_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer := 0;
  v_rows integer;
begin
  -- 24 hours before. Skipped when the booking was made inside that window:
  -- the booking email already went out moments ago.
  insert into public.appointment_email_outbox (appointment_id, event_type, recipient_email, scheduled_for)
  select a.id, 'reminder_24h', lower(btrim(coalesce(a.guest_email::text, p.email::text))), a.starts_at
  from public.appointments a
  left join public.profiles p on p.id = a.client_id
  where a.status in ('pending', 'confirmed')
    and a.starts_at >  now() + interval '2 hours'
    and a.starts_at <= now() + interval '24 hours'
    and a.created_at < a.starts_at - interval '24 hours'
    and coalesce(a.guest_email::text, p.email::text) is not null
  on conflict do nothing;
  get diagnostics v_rows = row_count; v_count := v_count + v_rows;

  -- 1 hour before. The lower bound is loose so a missed tick still catches
  -- it; the unique index stops duplicates.
  insert into public.appointment_email_outbox (appointment_id, event_type, recipient_email, scheduled_for)
  select a.id, 'reminder_1h', lower(btrim(coalesce(a.guest_email::text, p.email::text))), a.starts_at
  from public.appointments a
  left join public.profiles p on p.id = a.client_id
  where a.status in ('pending', 'confirmed')
    and a.starts_at >  now() + interval '10 minutes'
    and a.starts_at <= now() + interval '60 minutes'
    and a.created_at < a.starts_at - interval '2 hours'
    and coalesce(a.guest_email::text, p.email::text) is not null
  on conflict do nothing;
  get diagnostics v_rows = row_count; v_count := v_count + v_rows;

  if v_count > 0 then
    perform private.kick_appointment_email_worker();
  end if;

  return v_count;
end;
$$;

create or replace function public.claim_appointment_email()
returns table(outbox_id uuid, appointment_id uuid, event_type text, recipient_email text, lease_token uuid, payload jsonb)
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Never send an email that has stopped being true by send time.
  update public.appointment_email_outbox q
  set status = 'skipped', last_error = 'skipped: no longer relevant at send time',
      lease_token = null, lease_until = null
  from public.appointments a
  where a.id = q.appointment_id
    and q.status = 'pending'
    and (
      -- cancelled since: only the cancellation notice still makes sense
      (a.status::text = 'cancelled' and q.event_type <> 'booking_cancelled')
      -- the session has started: no reminders, no "see you soon"
      or (a.starts_at <= now() and q.event_type <> 'booking_cancelled')
      -- finished or no-show: nothing to remind about
      or (a.status::text in ('completed', 'no_show') and q.event_type like 'reminder_%')
      -- moved since this reminder was queued: it describes the wrong time
      or (q.event_type like 'reminder_%' and q.scheduled_for is distinct from a.starts_at)
      -- a day-before reminder that slipped past its moment would contradict
      -- the one-hour reminder
      or (q.event_type = 'reminder_24h' and a.starts_at <= now() + interval '2 hours')
    );

  return query
  with candidate as (
    select q.id
    from public.appointment_email_outbox q
    where q.status in ('pending', 'sending')
      and q.next_attempt_at <= now()
      and (q.lease_until is null or q.lease_until < now())
    order by q.next_attempt_at, q.created_at
    limit 1
    for update skip locked
  ), claimed as (
    update public.appointment_email_outbox q
    set status = 'sending', lease_token = gen_random_uuid(),
        lease_until = now() + interval '5 minutes'
    from candidate c
    where q.id = c.id
    returning q.*
  )
  select q.id, q.appointment_id, q.event_type, q.recipient_email, q.lease_token,
    jsonb_build_object(
      'id', a.id,
      'reference', a.reference,
      'name', coalesce(a.guest_name, p.full_name, ''),
      'email', q.recipient_email,
      'therapist', t.display_name,
      'service', s.name,
      'starts_at', a.starts_at,
      'ends_at', a.ends_at,
      'modality', a.modality,
      'status', a.status,
      'price_cents', a.price_cents,
      'currency', a.currency,
      'meeting_url', a.meeting_url,
      'location_note', a.location_note,
      -- Guests have no profile; their zone was captured at booking time.
      'timezone', coalesce(nullif(a.intake->>'timezone', ''), p.timezone, t.timezone, 'UTC'),
      'site_url', coalesce(current_setting('app.site_url', true), '')
    )
  from claimed q
  join public.appointments a on a.id = q.appointment_id
  join public.therapists t on t.id = a.therapist_id
  join public.services s on s.id = a.service_id
  left join public.profiles p on p.id = a.client_id;
end;
$$;

-- Minute precision for reminders. The query is indexed and takes ~10ms.
select cron.alter_job(
  (select jobid from cron.job where jobname = 'appointment-email-reminders'),
  schedule := '* * * * *'
);
