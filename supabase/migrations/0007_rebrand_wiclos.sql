-- Rebranding : "Cercle" → "Wiclos". Seul changement fonctionnel : le préfixe
-- des salons Jitsi générés par join_theme(). Le reste du renommage est côté
-- application (titres, textes, métadonnées).

create or replace function public.join_theme(p_theme_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_capacity int;
  v_scheduled_at timestamptz;
  v_status text;
  v_waiting_count int;
  v_circle_id uuid;
  v_meeting_url text;
  v_theme_title text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_theme_id::text));

  select capacity, scheduled_at, status, title
    into v_capacity, v_scheduled_at, v_status, v_theme_title
  from public.themes
  where id = p_theme_id;

  if v_capacity is null then
    raise exception 'theme_not_found';
  end if;

  if v_status <> 'open' then
    raise exception 'theme_not_open';
  end if;

  if v_scheduled_at < now() then
    raise exception 'theme_expired';
  end if;

  insert into public.registrations (user_id, theme_id)
  values (v_user_id, p_theme_id)
  on conflict (user_id, theme_id) do nothing;

  select count(*) into v_waiting_count
  from public.registrations
  where theme_id = p_theme_id and circle_id is null;

  if v_waiting_count < v_capacity then
    return jsonb_build_object('status', 'waiting', 'count', v_waiting_count, 'capacity', v_capacity);
  end if;

  v_meeting_url := 'https://meet.jit.si/wiclos-' || substr(md5(p_theme_id::text || random()::text), 1, 12);

  insert into public.circles (theme_id, meeting_url, capacity)
  values (p_theme_id, v_meeting_url, v_capacity)
  returning id into v_circle_id;

  with oldest as (
    select id from public.registrations
    where theme_id = p_theme_id and circle_id is null
    order by created_at asc
    limit v_capacity
  )
  update public.registrations
  set circle_id = v_circle_id
  where id in (select id from oldest);

  update public.themes set status = 'confirmed' where id = p_theme_id;

  insert into public.notification_queue (circle_id, user_id)
  select v_circle_id, r.user_id
  from public.registrations r
  where r.circle_id = v_circle_id;

  return jsonb_build_object('status', 'matched', 'circle_id', v_circle_id, 'meeting_url', v_meeting_url);
end;
$$;
