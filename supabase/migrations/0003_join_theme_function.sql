-- CERCLE — logique de matching atomique (§5 de la spec)
--
-- Fonction Postgres appelée via supabase.rpc('join_theme', { p_theme_id }).
-- Le verrou pg_advisory_xact_lock sérialise les appels concurrents sur le
-- même thème, sans bloquer les autres thèmes.
--
-- Point d'attention : `security definer` donne à cette fonction des droits
-- élevés (volontaire). Ne rien ajouter dedans sans revue.

create or replace function public.join_theme(p_theme_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_capacity int := 8;
  v_waiting_count int;
  v_circle_id uuid;
  v_meeting_url text;
  v_theme_slug text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  -- Verrou par thème : deux appels sur le même thème s'exécutent en série
  perform pg_advisory_xact_lock(hashtext(p_theme_id::text));

  -- Inscription idempotente
  insert into public.registrations (user_id, theme_id)
  values (v_user_id, p_theme_id)
  on conflict (user_id, theme_id) do nothing;

  select count(*) into v_waiting_count
  from public.registrations
  where theme_id = p_theme_id and circle_id is null;

  if v_waiting_count < v_capacity then
    return jsonb_build_object('status', 'waiting', 'count', v_waiting_count, 'capacity', v_capacity);
  end if;

  -- Capacité atteinte : on forme le cercle avec les v_capacity plus anciens
  select slug into v_theme_slug from public.themes where id = p_theme_id;
  v_meeting_url := 'https://meet.jit.si/cercle-' || v_theme_slug || '-' || substr(md5(random()::text), 1, 8);

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

  -- On pousse dans la file de notification (table seulement pour l'instant —
  -- aucun traitement/envoi n'est branché dessus, voir README §Notifications)
  insert into public.notification_queue (circle_id, user_id)
  select v_circle_id, r.user_id
  from public.registrations r
  where r.circle_id = v_circle_id;

  return jsonb_build_object('status', 'matched', 'circle_id', v_circle_id, 'meeting_url', v_meeting_url);
end;
$$;

revoke all on function public.join_theme from public;
grant execute on function public.join_theme to authenticated;
