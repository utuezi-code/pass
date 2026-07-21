-- Créneaux récurrents : un "modèle" de thème regénéré automatiquement
-- chaque semaine (ex: "Politique — tous les vendredis 20h"), pour donner un
-- signal de fiabilité/habitude dès le lancement.
--
-- La génération effective (insertion d'une nouvelle ligne `themes` chaque
-- semaine) est faite par generate_recurring_themes(), à planifier via
-- pg_cron depuis le dashboard Supabase (pas d'accès à cette étape depuis
-- cette migration — voir commentaire en fin de fichier).

create table public.recurring_slots (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  created_by uuid not null references public.profiles(id),
  title text not null,
  description text not null,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = dimanche
  time_of_day time not null,
  capacity int,
  active boolean not null default true,
  next_run_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.themes add column recurring_slot_id uuid references public.recurring_slots(id);

alter table public.recurring_slots enable row level security;

-- Rien de sensible (pas de données personnelles) : lecture publique pour
-- que l'UI puisse afficher un badge "récurrent" avec le jour/l'heure.
create policy "recurring_slots: public read" on public.recurring_slots
  for select using (active = true);

-- Pas de policy insert/update pour authenticated : la création de créneaux
-- récurrents reste une opération faite depuis le dashboard/service role
-- pour ce sprint (pas d'UI de gestion prévue ici).

create or replace function public.generate_recurring_themes()
returns int
language plpgsql
security definer
as $$
declare
  v_slot record;
  v_count int := 0;
begin
  for v_slot in
    select * from public.recurring_slots
    where active = true and next_run_at <= now() + interval '7 days'
  loop
    insert into public.themes (category_id, creator_id, title, description, scheduled_at, capacity, recurring_slot_id)
    values (
      v_slot.category_id,
      v_slot.created_by,
      v_slot.title,
      v_slot.description,
      v_slot.next_run_at,
      coalesce(v_slot.capacity, public.get_config_int('circle_capacity', 8)),
      v_slot.id
    );

    update public.recurring_slots
    set next_run_at = next_run_at + interval '7 days'
    where id = v_slot.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.generate_recurring_themes() from public;
grant execute on function public.generate_recurring_themes() to service_role;

-- Pour activer : planifier `select public.generate_recurring_themes();` en
-- cron hebdomadaire (Supabase Dashboard → Database → Cron, ou pg_cron si
-- l'extension est disponible sur le projet), et insérer des lignes dans
-- `recurring_slots` (aucune UI de création pour l'instant, à faire à la main
-- via le SQL editor tant qu'il n'y a pas de panel admin).
