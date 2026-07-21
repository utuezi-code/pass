-- Modération dès le lancement : un numéro WhatsApp unique par compte
-- (empêche de contourner une suspension en recréant un compte avec le même
-- numéro — l'email est déjà unique nativement via Supabase Auth), un système
-- de signalement, et une suspension automatique au-delà d'un seuil.

alter table public.profiles add column suspended boolean not null default false;
alter table public.profiles
  add constraint profiles_whatsapp_number_key unique (whatsapp_number);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  reported_id uuid not null references public.profiles(id),
  circle_id uuid references public.circles(id),
  reason text not null,
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create index on public.reports (reported_id);

alter table public.reports enable row level security;

-- Un utilisateur ne voit/crée que ses propres signalements (jamais visibles
-- par la personne signalée ni par les autres membres).
create policy "reports: self insert" on public.reports
  for insert with check (auth.uid() = reporter_id);
create policy "reports: self read" on public.reports
  for select using (auth.uid() = reporter_id);

-- Suspension automatique : 3 signalements de personnes distinctes suffisent.
create or replace function public.check_auto_suspend()
returns trigger
language plpgsql
security definer
as $$
declare
  v_distinct_reporters int;
begin
  select count(distinct reporter_id) into v_distinct_reporters
  from public.reports
  where reported_id = new.reported_id;

  if v_distinct_reporters >= 3 then
    update public.profiles set suspended = true where id = new.reported_id;
  end if;

  return new;
end;
$$;

create trigger reports_auto_suspend
  after insert on public.reports
  for each row execute function public.check_auto_suspend();

-- Un membre d'un cercle déjà formé peut voir qui d'autre en fait partie
-- (nécessaire pour pouvoir signaler quelqu'un). Les inscriptions en attente
-- (circle_id null, thème pas encore complet) restent invisibles aux autres —
-- seule la formation effective d'un cercle rend les membres visibles entre eux.
create policy "registrations: circle members read" on public.registrations
  for select using (
    circle_id is not null
    and exists (
      select 1 from public.registrations r2
      where r2.circle_id = registrations.circle_id and r2.user_id = auth.uid()
    )
  );

-- join_theme() : un compte suspendu ne peut plus rejoindre de cercle.
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

  if exists (select 1 from public.profiles where id = v_user_id and suspended) then
    raise exception 'account_suspended';
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

-- themes : un compte suspendu ne peut plus proposer de nouveau thème.
drop policy if exists "themes: authenticated create own" on public.themes;
create policy "themes: authenticated create own" on public.themes
  for insert with check (
    auth.uid() = creator_id
    and not exists (select 1 from public.profiles where id = auth.uid() and suspended)
  );
