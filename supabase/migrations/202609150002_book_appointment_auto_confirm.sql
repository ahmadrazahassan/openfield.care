-- Applied to project uxjfzgkllqjqsdhnmiwa on 2026-09-15 as
-- "book_appointment_auto_confirm".
--
-- New bookings are inserted with status 'confirmed' instead of 'pending'.
-- The email trigger maps an INSERT with status 'confirmed' to the
-- 'booking_confirmed' email, so the customer receives one confirmation
-- immediately rather than a "request received" note.
do $$
declare v_oid oid; v_def text; v_new text;
begin
  select p.oid into v_oid from pg_proc p
  where p.proname = 'book_appointment' and p.pronamespace = 'public'::regnamespace;
  v_def := pg_get_functiondef(v_oid);
  v_new := regexp_replace(v_def, '''pending''(\s*,\s*p_modality)', '''confirmed''\1');
  if v_new = v_def then
    raise exception 'insert status literal not found; function left unchanged';
  end if;
  execute v_new;
end $$;
