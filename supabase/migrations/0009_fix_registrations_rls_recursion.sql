-- La policy "registrations: circle members read" se référence elle-même
-- (sous-requête sur registrations dans une policy sur registrations), ce qui
-- déclenche une récursion infinie côté Postgres RLS. Le correctif standard :
-- déporter la vérification d'appartenance dans une fonction security definer,
-- dont l'exécution n'est pas re-soumise à la policy qu'elle sert à évaluer.

create or replace function public.is_circle_member(p_circle_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.registrations
    where circle_id = p_circle_id and user_id = auth.uid()
  );
$$;

drop policy if exists "registrations: circle members read" on public.registrations;
create policy "registrations: circle members read" on public.registrations
  for select using (
    circle_id is not null and public.is_circle_member(circle_id)
  );
