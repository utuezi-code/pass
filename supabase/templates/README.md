# Templates d'email Supabase Auth

Ces fichiers ne sont **pas** appliqués automatiquement (pas de CLI Supabase
liée à ce projet) — ils documentent le contenu poussé manuellement via
l'API Management dans `config/auth` :

- `confirmation.html` → `mailer_templates_confirmation_content`
- Sujet associé : `🔥 Confirmez votre email pour rejoindre Wiclos`
  (`mailer_subjects_confirmation`)

Si vous modifiez ce fichier, il faut repousser son contenu via l'API
Management Supabase (`PATCH /v1/projects/{ref}/config/auth`) ou coller le
HTML dans Dashboard → Authentication → Email Templates → Confirm signup.
