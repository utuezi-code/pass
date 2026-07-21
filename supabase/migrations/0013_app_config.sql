-- Configuration applicative modifiable sans redéploiement (clé/valeur en
-- base). Premier usage : rendre la taille cible des cercles ajustable
-- (4 → 6 → 8) via un simple `update`, plutôt qu'une constante en dur.

create table public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

-- Rien de sensible ici (pas de secret, pas de donnée utilisateur) : lecture
-- publique pour que le client puisse s'y référer si besoin plus tard.
create policy "app_config: public read" on public.app_config
  for select using (true);

-- Écriture réservée au service role (pas de policy insert/update pour
-- authenticated/anon).

insert into public.app_config (key, value) values
  ('circle_capacity', '8'),
  ('invite_only_mode', 'false');

create or replace function public.get_config_int(p_key text, p_default int)
returns int
language sql
stable
as $$
  select coalesce((select (value #>> '{}')::int from public.app_config where key = p_key), p_default);
$$;

create or replace function public.get_config_bool(p_key text, p_default boolean)
returns boolean
language sql
stable
as $$
  select coalesce((select (value #>> '{}')::boolean from public.app_config where key = p_key), p_default);
$$;

-- Taille adaptative des cercles : la capacité par défaut d'un nouveau thème
-- suit désormais app_config.circle_capacity au lieu d'une constante 8 figée
-- dans le schéma. join_theme() lisait déjà `themes.capacity` dynamiquement
-- (donc la mécanique de matching était déjà "adaptative" par thème) — ce qui
-- manquait, c'est de pouvoir changer la valeur par défaut sans migration.
alter table public.themes alter column capacity drop default;
alter table public.themes alter column capacity set default public.get_config_int('circle_capacity', 8);
