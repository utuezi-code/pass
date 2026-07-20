# Templates d'email Supabase Auth

Ces fichiers ne sont **pas** appliqués automatiquement (pas de CLI Supabase
liée à ce projet) — ils documentent le contenu poussé manuellement via
l'API Management dans `config/auth` :

| Fichier | Champ `config/auth` | Sujet |
|---|---|---|
| `confirmation.html` | `mailer_templates_confirmation_content` | 🔥 Confirmez votre email pour rejoindre Wiclos (`mailer_subjects_confirmation`) |
| `recovery.html` | `mailer_templates_recovery_content` | 🔥 Réinitialisez votre mot de passe Wiclos (`mailer_subjects_recovery`) |
| `magic-link.html` | `mailer_templates_magic_link_content` | 🔥 Votre lien de connexion Wiclos (`mailer_subjects_magic_link`) |

Design commun : fond sombre, bandeau orange, flamme avec halo, masthead
"WICLOS", eyebrow label par contexte, CTA pilule orange. `{{ .ConfirmationURL }}`
est le placeholder rempli par Supabase avec le lien de vérification réel.

Si vous modifiez un de ces fichiers, il faut repousser son contenu via
l'API Management Supabase (`PATCH /v1/projects/{ref}/config/auth`) ou
coller le HTML dans Dashboard → Authentication → Email Templates.
