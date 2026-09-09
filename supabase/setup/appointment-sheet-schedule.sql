-- One-time activation, after the migration and Supabase Edge Function are ready.
-- Enable Cron (pg_cron) and pg_net in the Supabase dashboard first.
-- Add two secrets through Supabase Vault UI:
--   appointment_sheet_sync_url = https://uxjfzgkllqjqsdhnmiwa.supabase.co/functions/v1/appointments-to-sheets
--   appointment_sheet_sync_secret = the deployed CRON_SECRET
-- Do not commit actual secret values in this file.
do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'appointment_sheet_sync_url')
    or not exists (select 1 from vault.decrypted_secrets where name = 'appointment_sheet_sync_secret') then
    raise exception 'Configure the two appointment sheet sync Vault secrets first';
  end if;
end $$;

select cron.schedule(
  'appointment-google-sheets-sync',
  '* * * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'appointment_sheet_sync_url' limit 1),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'appointment_sheet_sync_secret' limit 1)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $job$
);
