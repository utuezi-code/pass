-- CERCLE — schéma initial (§4 de la spec)

-- Profils utilisateurs (complète auth.users, géré par Supabase Auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  whatsapp_number text not null,       -- format E.164, ex: +2250700000000
  whatsapp_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  emoji text not null default '🔥',
  active boolean not null default true,
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
  unique (user_id, theme_id)             -- pas de double inscription au même thème
);

-- File d'attente de notifications — découple le matching de l'envoi WhatsApp.
-- NB: le traitement de cette file (Edge Function + Twilio, §6 de la spec)
-- n'est volontairement pas implémenté pour l'instant. La table existe pour
-- que join_theme() puisse déjà pousser les événements à notifier plus tard,
-- sans qu'aucun envoi réel n'ait lieu.
create table public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id),
  user_id uuid not null references public.profiles(id),
  channel text not null default 'whatsapp',
  status text not null default 'pending',  -- pending | sent | failed
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index on public.registrations (theme_id, circle_id);
create index on public.notification_queue (status);

-- Compteur agrégé par thème (nombre de personnes en attente, 0→8).
-- Existe séparément de `registrations` car RLS restreint la lecture de
-- `registrations` à ses propres lignes (voir §4 policies) : impossible pour
-- un visiteur de "compter" les lignes des autres directement. Cette table
-- n'expose que theme_id + un compte, jamais d'identité, donc elle peut être
-- publique et servir de source au compteur temps réel de /themes.
create table public.theme_counts (
  theme_id uuid primary key references public.themes(id),
  waiting_count int not null default 0,
  updated_at timestamptz not null default now()
);

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

-- Réplication temps réel (Supabase Realtime) pour le compteur live sur /themes
alter publication supabase_realtime add table public.theme_counts;
