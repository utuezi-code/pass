-- Trouvé en recette : la policy "profiles: self update" (auth.uid() = id)
-- n'a pas de WITH CHECK dédié, donc Postgres réutilise la clause USING pour
-- valider aussi les écritures — un utilisateur peut donc modifier n'importe
-- quelle colonne de son propre profil, y compris `suspended`. Un compte
-- suspendu pouvait se lever lui-même la suspension via un simple appel
-- `update` côté client. RLS ne permet pas de restreindre par colonne : on
-- verrouille donc au niveau des privilèges Postgres, qui s'appliquent avant
-- même l'évaluation des policies RLS.

revoke update (suspended) on public.profiles from authenticated;
