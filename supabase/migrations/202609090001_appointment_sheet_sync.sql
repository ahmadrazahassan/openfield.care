-- Run once against the existing Openfield schema. No historical bookings are
-- exported by this migration: future inserts/updates are queued automatically.
begin;

create table public.appointment_sheet_sync (
  appointment_id uuid primary key references public.appointments(id) on delete cascade,
  sheet_row bigint generated always as identity (start with 2) unique,
  version bigint not null default 1,
  synced_version bigint not null default 0,
  lease_token uuid,
  lease_until timestamptz,
  retry_at timestamptz not null default now(),
  attempts integer not null default 0,
  last_error text,
  synced_at timestamptz
);
alter table public.appointment_sheet_sync enable row level security;
revoke all on public.appointment_sheet_sync from public, anon, authenticated;

create function public.enqueue_appointment_sheet_sync() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.appointment_sheet_sync (appointment_id) values (new.id)
  on conflict (appointment_id) do update
    set version = public.appointment_sheet_sync.version + 1,
        retry_at = now(), attempts = 0, last_error = null;
  return new;
end;
$$;
revoke all on function public.enqueue_appointment_sheet_sync() from public, anon, authenticated;

create trigger appointment_sheet_sync_enqueue
after insert or update of status, starts_at, ends_at, guest_name, guest_email,
  guest_phone, therapist_id, service_id, modality, price_cents, currency
on public.appointments for each row execute function public.enqueue_appointment_sheet_sync();

-- Claim one job at a time. A crashed worker's lease expires automatically.
create function public.claim_appointment_sheet_sync()
returns table (appointment_id uuid, sheet_row bigint, version bigint, lease_token uuid, payload jsonb)
language sql security definer set search_path = '' as $$
  with candidate as (
    select q.appointment_id from public.appointment_sheet_sync q
    where q.version > q.synced_version and q.retry_at <= now()
      and (q.lease_until is null or q.lease_until < now())
    order by q.retry_at, q.sheet_row
    limit 1 for update skip locked
  ), claimed as (
    update public.appointment_sheet_sync q
    set lease_token = gen_random_uuid(), lease_until = now() + interval '5 minutes'
    from candidate c where q.appointment_id = c.appointment_id returning q.*
  )
  select q.appointment_id, q.sheet_row, q.version, q.lease_token,
    jsonb_build_object(
      'id', a.id, 'reference', a.reference,
      'name', coalesce(a.guest_name, p.full_name, ''),
      'email', coalesce(a.guest_email, p.email, ''),
      'phone', coalesce(a.guest_phone, p.phone, ''),
      'therapist', t.display_name, 'service', s.name,
      'starts_at', a.starts_at, 'ends_at', a.ends_at,
      'modality', a.modality, 'status', a.status,
      'price_cents', a.price_cents, 'currency', a.currency,
      'updated_at', a.updated_at
    )
  from claimed q join public.appointments a on a.id = q.appointment_id
  join public.therapists t on t.id = a.therapist_id
  join public.services s on s.id = a.service_id
  left join public.profiles p on p.id = a.client_id;
$$;

create function public.finish_appointment_sheet_sync(
  p_appointment_id uuid, p_lease_token uuid, p_version bigint,
  p_error text default null
) returns void language sql security definer set search_path = '' as $$
  update public.appointment_sheet_sync q set
    synced_version = case when p_error is null then greatest(q.synced_version, p_version) else q.synced_version end,
    synced_at = case when p_error is null then now() else q.synced_at end,
    attempts = case when p_error is null then 0 else q.attempts + 1 end,
    retry_at = case when p_error is null or q.version > p_version then now()
      else now() + make_interval(secs => least(3600, 30 * power(2, least(q.attempts, 7)))::int) end,
    last_error = left(p_error, 100), lease_token = null, lease_until = null
  where q.appointment_id = p_appointment_id and q.lease_token = p_lease_token;
$$;
revoke all on function public.claim_appointment_sheet_sync() from public, anon, authenticated;
revoke all on function public.finish_appointment_sheet_sync(uuid, uuid, bigint, text) from public, anon, authenticated;
grant execute on function public.claim_appointment_sheet_sync() to service_role;
grant execute on function public.finish_appointment_sheet_sync(uuid, uuid, bigint, text) to service_role;
commit;
