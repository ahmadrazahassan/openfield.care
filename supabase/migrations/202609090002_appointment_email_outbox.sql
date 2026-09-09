-- Appointment email delivery.
--
-- The appointment transaction only writes to this outbox. A hosted Edge
-- Function drains it and calls the email provider, so a provider outage never
-- makes a booking fail. Every delivery is leased and retried idempotently.
begin;

create table public.appointment_email_outbox (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid not null references public.appointments(id) on delete cascade,
  event_type      text not null check (event_type in (
    'booking_received', 'booking_confirmed', 'booking_rescheduled', 'booking_cancelled'
  )),
  recipient_email text not null,
  payload         jsonb not null default '{}'::jsonb,
  status          text not null default 'pending' check (status in ('pending', 'sending', 'sent')),
  attempts        integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  lease_token     uuid,
  lease_until     timestamptz,
  last_error      text,
  created_at      timestamptz not null default now(),
  sent_at         timestamptz
);

create index appointment_email_outbox_ready_idx
  on public.appointment_email_outbox (next_attempt_at, created_at)
  where status <> 'sent';

alter table public.appointment_email_outbox enable row level security;
revoke all on public.appointment_email_outbox from public, anon, authenticated;

create or replace function public.enqueue_appointment_email(
  p_appointment_id uuid,
  p_event_type text,
  p_recipient_email text
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_recipient_email is null or btrim(p_recipient_email) = '' then
    return;
  end if;

  insert into public.appointment_email_outbox (
    appointment_id, event_type, recipient_email
  ) values (
    p_appointment_id, p_event_type, lower(btrim(p_recipient_email))
  );
end;
$$;
revoke all on function public.enqueue_appointment_email(uuid, text, text)
  from public, anon, authenticated;

create or replace function public.enqueue_appointment_email_event()
returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_recipient text;
  v_event text;
begin
  select coalesce(new.guest_email, (
    select p.email::text from public.profiles p where p.id = new.client_id
  )) into v_recipient;

  if tg_op = 'INSERT' then
    v_event := case when new.status::text = 'confirmed'
      then 'booking_confirmed' else 'booking_received' end;
  elsif old.status::text is distinct from new.status::text then
    v_event := case new.status::text
      when 'confirmed' then 'booking_confirmed'
      when 'cancelled' then 'booking_cancelled'
      else null
    end;
  elsif old.starts_at is distinct from new.starts_at
     or old.ends_at is distinct from new.ends_at
     or old.therapist_id is distinct from new.therapist_id
     or old.service_id is distinct from new.service_id
     or old.modality is distinct from new.modality then
    v_event := 'booking_rescheduled';
  end if;

  if v_event is not null then
    perform public.enqueue_appointment_email(new.id, v_event, v_recipient);
  end if;
  return new;
end;
$$;
revoke all on function public.enqueue_appointment_email_event()
  from public, anon, authenticated;

create trigger appointment_email_outbox_enqueue
after insert or update of status, starts_at, ends_at, therapist_id, service_id,
  modality, guest_name, guest_email, guest_phone
on public.appointments for each row
execute function public.enqueue_appointment_email_event();

-- One worker claims one row at a time. A process crash leaves a five-minute
-- lease which becomes available again automatically.
create or replace function public.claim_appointment_email()
returns table (
  outbox_id uuid,
  appointment_id uuid,
  event_type text,
  recipient_email text,
  lease_token uuid,
  payload jsonb
)
language sql security definer set search_path = '' as $$
  with candidate as (
    select q.id
    from public.appointment_email_outbox q
    where q.status <> 'sent'
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
  select q.id, q.appointment_id, q.event_type, q.recipient_email,
    q.lease_token,
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
      'timezone', coalesce(p.timezone, t.timezone, 'UTC'),
      'site_url', coalesce(current_setting('app.site_url', true), '')
    )
  from claimed q
  join public.appointments a on a.id = q.appointment_id
  join public.therapists t on t.id = a.therapist_id
  join public.services s on s.id = a.service_id
  left join public.profiles p on p.id = a.client_id;
$$;
revoke all on function public.claim_appointment_email()
  from public, anon, authenticated;

create or replace function public.finish_appointment_email(
  p_outbox_id uuid,
  p_lease_token uuid,
  p_error text default null
) returns void
language sql security definer set search_path = '' as $$
  update public.appointment_email_outbox q set
    status = case when p_error is null then 'sent' else 'pending' end,
    attempts = case when p_error is null then q.attempts else q.attempts + 1 end,
    next_attempt_at = case when p_error is null then now()
      else now() + make_interval(secs => least(3600, 30 * power(2, least(q.attempts, 7)))::int) end,
    last_error = left(p_error, 500),
    sent_at = case when p_error is null then now() else q.sent_at end,
    lease_token = null,
    lease_until = null
  where q.id = p_outbox_id and q.lease_token = p_lease_token;
$$;
revoke all on function public.finish_appointment_email(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.claim_appointment_email() to service_role;
grant execute on function public.finish_appointment_email(uuid, uuid, text) to service_role;

commit;
