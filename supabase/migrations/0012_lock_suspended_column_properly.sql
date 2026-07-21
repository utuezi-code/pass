-- La migration précédente (0011) ne suffisait pas : Supabase accorde par
-- défaut UPDATE sur toute la table `profiles` au rôle `authenticated`, ce
-- qui prime sur un simple `revoke update (suspended)`. Il faut révoquer le
-- privilège au niveau table puis le redonner uniquement sur les colonnes que
-- les utilisateurs doivent pouvoir modifier eux-mêmes.

revoke update on public.profiles from authenticated;
grant update (full_name, whatsapp_number) on public.profiles to authenticated;
