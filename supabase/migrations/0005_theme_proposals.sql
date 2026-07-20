-- CERCLE — évolution du modèle : catégories fixes + thèmes proposés
--
-- Les 4 lignes existantes de `themes` (Créativité, Carrière, Bien-être,
-- Voyage) deviennent des CATÉGORIES fixes. Un `theme` est désormais une
-- proposition faite par un utilisateur : titre, description, date
-- d'échange, capacité (seuil de participants), rattachée à une catégorie.

-- On repart propre sur les tables qui dépendaient de l'ancien `themes`
-- (aucune donnée réelle à préserver : 0 inscription/cercle en prod à ce
-- stade).
drop table if exists public.notification_queue cascade;
drop table if exists public.theme_counts cascade;
drop table if exists public.registrations cascade;
drop table if exists public.circles cascade;
drop function if exists public.join_theme(uuid);
drop function if exists public.sync_theme_counts();

alter table public.themes rename to categories;

alter table public.categories
  drop constraint if exists themes_slug_key,
  add constraint categories_slug_key unique (slug);

alter policy "themes: public read" on public.categories
  rename to "categories: public read";

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  creator_id uuid not null references public.profiles(id),
  title text not null,
  description text not null,
  scheduled_at timestamptz not null,
  capacity int not null default 8,
  status text not null default 'open', -- open | confirmed | cancelled | completed
  created_at timestamptz not null default now()
);

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  theme_id uuid not null references public.themes(id),
  meeting_url text not null,
  capacity int not null default 8,
  status text not null default 'scheduled', -- scheduled | completed | cancelled
  created_at timestamptz not null default now()
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  theme_id uuid not null references public.themes(id),
  circle_id uuid references public.circles(id),
  created_at timestamptz not null default now(),
  unique (user_id, theme_id)
);

create table public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id),
  user_id uuid not null references public.profiles(id),
  channel text not null default 'whatsapp',
  status text not null default 'pending',
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table public.theme_counts (
  theme_id uuid primary key references public.themes(id),
  waiting_count int not null default 0,
  updated_at timestamptz not null default now()
);

create index on public.themes (category_id, scheduled_at);
create index on public.registrations (theme_id, circle_id);
create index on public.notification_queue (status);

-- Compteur agrégé (même raison qu'avant : RLS interdit de compter les
-- inscriptions des autres directement sur `registrations`).
create or replace function public.sync_theme_counts()
returns trigger
language plpgsql
security definer
as $$
declare
  v_theme_id uuid := coalesce(new.theme_id, old.theme_id);
begin
  insert into public.theme_counts (theme_id, waiting_count, updated_at)
  values (
    v_theme_id,
    (select count(*) from public.registrations where theme_id = v_theme_id and circle_id is null),
    now()
  )
  on conflict (theme_id) do update
    set waiting_count = excluded.waiting_count,
        updated_at = excluded.updated_at;
  return null;
end;
$$;

create trigger registrations_sync_theme_counts
  after insert or update of circle_id or delete on public.registrations
  for each row execute function public.sync_theme_counts();

alter publication supabase_realtime add table public.theme_counts;

-- Logique de matching atomique (§5 de la spec), adaptée : la capacité et
-- la date limite viennent désormais de la ligne `themes` elle-même.
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

  v_meeting_url := 'https://meet.jit.si/cercle-' || substr(md5(p_theme_id::text || random()::text), 1, 12);

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

revoke all on function public.join_theme(uuid) from public;
grant execute on function public.join_theme(uuid) to authenticated;

-- RLS
alter table public.themes enable row level security;
alter table public.circles enable row level security;
alter table public.registrations enable row level security;
alter table public.notification_queue enable row level security;
alter table public.theme_counts enable row level security;

create policy "themes: public read" on public.themes
  for select using (true);
create policy "themes: authenticated create own" on public.themes
  for insert with check (auth.uid() = creator_id);

create policy "circles: members read" on public.circles
  for select using (
    exists (
      select 1 from public.registrations r
      where r.circle_id = circles.id and r.user_id = auth.uid()
    )
  );

create policy "registrations: self read" on public.registrations
  for select using (auth.uid() = user_id);
create policy "registrations: self insert" on public.registrations
  for insert with check (auth.uid() = user_id);

create policy "theme_counts: public read" on public.theme_counts
  for select using (true);
