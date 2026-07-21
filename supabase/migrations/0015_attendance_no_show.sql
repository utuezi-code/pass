-- Suivi des présences — fondations seulement (pas de pénalité automatique
-- pour l'instant, juste le comptage, conformément au périmètre retenu pour
-- ce sprint). Une ligne `pending` est créée pour chaque membre dès que son
-- cercle se forme ; elle passe à `present` quand le membre rejoint
-- effectivement la visio, ou à `no_show` si elle reste `pending` après la
-- fenêtre de tolérance.

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id),
  user_id uuid not null references public.profiles(id),
  status text not null default 'pending', -- pending | present | no_show
  marked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (circle_id, user_id)
);

alter table public.profiles add column no_show_count int not null default 0;

alter table public.attendance enable row level security;

-- Lecture : uniquement sa propre ligne de présence (jamais celle des
-- autres membres du cercle).
create policy "attendance: self read" on public.attendance
  for select using (auth.uid() = user_id);

-- Pas de policy insert/update pour authenticated : toute écriture passe par
-- les fonctions security definer ci-dessous.

create or replace function public.mark_attendance(p_circle_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  update public.attendance
  set status = 'present', marked_at = now()
  where circle_id = p_circle_id and user_id = v_user_id and status = 'pending';
end;
$$;

revoke all on function public.mark_attendance(uuid) from public;
grant execute on function public.mark_attendance(uuid) to authenticated;

-- Bascule en no_show les présences restées `pending` 15 minutes après le
-- début du créneau du thème associé, et incrémente le compteur du profil.
-- Pas de branchement automatique (pg_cron) dans cette migration — la
-- fonction est prête à être planifiée depuis le dashboard Supabase
-- (Database → Cron) une fois l'accès disponible.
create or replace function public.sweep_no_shows()
returns int
language plpgsql
security definer
as $$
declare
  v_count int;
begin
  with missed as (
    update public.attendance a
    set status = 'no_show', marked_at = now()
    from public.circles c
    join public.themes t on t.id = c.theme_id
    where a.circle_id = c.id
      and a.status = 'pending'
      and t.scheduled_at < now() - interval '15 minutes'
    returning a.user_id
  )
  update public.profiles p
  set no_show_count = p.no_show_count + 1
  from missed
  where p.id = missed.user_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.sweep_no_shows() from public;
grant execute on function public.sweep_no_shows() to service_role;

-- join_theme() : seede une ligne `attendance` pending pour chaque membre
-- au moment où le cercle se forme (reprend la fonction de 0007, augmentée).
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

  insert into public.attendance (circle_id, user_id)
  select v_circle_id, r.user_id
  from public.registrations r
  where r.circle_id = v_circle_id;

  return jsonb_build_object('status', 'matched', 'circle_id', v_circle_id, 'meeting_url', v_meeting_url);
end;
$$;
