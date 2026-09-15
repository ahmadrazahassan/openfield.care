-- Tell the email renderer whether a booking belongs to an account. Guests have
-- no login, so their emails must not link to /account/appointments.
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
      (a.status::text = 'cancelled' and q.event_type <> 'booking_cancelled')
      or (a.starts_at <= now() and q.event_type <> 'booking_cancelled')
      or (a.status::text in ('completed', 'no_show') and q.event_type like 'reminder_%')
      or (q.event_type like 'reminder_%' and q.scheduled_for is distinct from a.starts_at)
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
      'timezone', coalesce(nullif(a.intake->>'timezone', ''), p.timezone, t.timezone, 'UTC'),
      'site_url', coalesce(current_setting('app.site_url', true), ''),
      'is_guest', a.client_id is null
    )
  from claimed q
  join public.appointments a on a.id = q.appointment_id
  join public.therapists t on t.id = a.therapist_id
  join public.services s on s.id = a.service_id
  left join public.profiles p on p.id = a.client_id;
end;
$$;
