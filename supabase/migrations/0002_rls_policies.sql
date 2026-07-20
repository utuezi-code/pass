-- CERCLE — Row Level Security (§4 de la spec)

alter table public.profiles enable row level security;
alter table public.themes enable row level security;
alter table public.circles enable row level security;
alter table public.registrations enable row level security;
alter table public.notification_queue enable row level security;
alter table public.theme_counts enable row level security;

-- Profils : chacun lit/modifie uniquement le sien
create policy "profiles: self read" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: self update" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles: self insert" on public.profiles
  for insert with check (auth.uid() = id);

-- Thèmes : lecture publique (même déconnecté), écriture réservée au service role
create policy "themes: public read" on public.themes
  for select using (active = true);

-- Cercles : visibles uniquement par leurs membres
create policy "circles: members read" on public.circles
  for select using (
    exists (
      select 1 from public.registrations r
      where r.circle_id = circles.id and r.user_id = auth.uid()
    )
  );

-- Inscriptions : chacun lit/crée les siennes
create policy "registrations: self read" on public.registrations
  for select using (auth.uid() = user_id);
create policy "registrations: self insert" on public.registrations
  for insert with check (auth.uid() = user_id);

-- notification_queue : jamais accessible côté client (service role uniquement,
-- pas de policy "using (true)" — donc invisible par défaut avec RLS activé)

-- theme_counts : lecture publique, ne contient qu'un nombre agrégé (pas
-- d'identité), alimente le compteur temps réel de /themes
create policy "theme_counts: public read" on public.theme_counts
  for select using (true);
