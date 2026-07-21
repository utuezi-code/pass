-- Codes d'invitation : accès anticipé contrôlé avant ouverture publique.
-- Désactivé par défaut (app_config.invite_only_mode = false, posé en 0013).
-- Consommation atomique via verrou consultatif (même schéma que join_theme)
-- pour éviter qu'un même code single-use soit validé deux fois en parallèle.

create table public.invite_codes (
  code text primary key,
  created_by uuid references public.profiles(id),
  max_uses int not null default 1,
  uses_count int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

-- Aucune policy select/insert pour anon/authenticated : un code ne doit pas
-- être énumérable ni son usage restant visible. Toute vérification passe
-- par consume_invite_code(), qui ne renvoie qu'un booléen.

create or replace function public.consume_invite_code(p_code text)
returns boolean
language plpgsql
security definer
as $$
declare
  v_rows int;
begin
  if p_code is null or length(trim(p_code)) = 0 then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtext('invite_code:' || p_code));

  update public.invite_codes
  set uses_count = uses_count + 1
  where code = p_code
    and uses_count < max_uses
    and (expires_at is null or expires_at > now());

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

revoke all on function public.consume_invite_code(text) from public;
grant execute on function public.consume_invite_code(text) to anon, authenticated;

-- Pas d'UI de création de codes pour ce sprint : à insérer à la main via le
-- SQL editor (`insert into invite_codes (code, created_by) values (...)`)
-- tant qu'il n'y a pas de panel admin.
