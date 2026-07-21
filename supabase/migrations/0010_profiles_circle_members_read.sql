-- La policy "registrations: circle members read" laisse voir les lignes de
-- registrations des autres membres d'un cercle confirmé, mais le nom
-- (profiles.full_name) reste bloqué par la policy "self read" de `profiles`.
-- On ajoute une lecture croisée limitée aux membres d'un même cercle formé.

create policy "profiles: circle members read" on public.profiles
  for select using (
    exists (
      select 1 from public.registrations r1
      join public.registrations r2 on r1.circle_id = r2.circle_id
      where r1.user_id = profiles.id
        and r2.user_id = auth.uid()
        and r1.circle_id is not null
    )
  );
