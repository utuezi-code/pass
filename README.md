# Wiclos

Un utilisateur s'inscrit sur un thème. Dès que 8 personnes ont rejoint le
même thème, le système forme automatiquement un cercle, génère un lien de
visioconférence (Jitsi), et l'affiche sur le tableau de bord de chaque
membre.

## Stack

- Next.js 16 (App Router, TypeScript, Server Actions)
- Supabase (Postgres, Auth, Realtime, Row Level Security)
- Tailwind CSS 4
- Zod

## Portée de cette version

Cette version implémente l'inscription, l'authentification, le matching
atomique (§5 de la spec) et le compteur temps réel — **sans** l'envoi de
notifications WhatsApp (§6 de la spec). Le numéro WhatsApp est collecté et
stocké (E.164) et la table `notification_queue` est bien alimentée par
`join_theme()`, mais aucun traitement (Edge Function, Twilio, retries
`pg_cron`) n'est branché dessus pour l'instant. Un utilisateur matché voit
son lien de visio directement dans `/dashboard`.

## Setup

1. Créer un projet Supabase.
2. Appliquer les migrations : `supabase db push` (ou coller le contenu de
   `supabase/migrations/*.sql` dans le SQL editor, dans l'ordre).
3. Copier `.env.example` en `.env.local` et renseigner les clés Supabase.
4. `npm install && npm run dev`.

## Structure

```
src/
├── app/
│   ├── page.tsx                    # landing
│   ├── register/                   # inscription + numéro WhatsApp (E.164)
│   ├── login/
│   ├── themes/page.tsx             # liste des thèmes + compteur Realtime
│   ├── dashboard/page.tsx          # inscriptions + lien du cercle matché
│   └── auth/callback/route.ts      # callback Supabase Auth
├── components/
│   ├── EmberRing.tsx                # compteur circulaire (Realtime)
│   └── JoinThemeButton.tsx          # appelle supabase.rpc('join_theme')
├── lib/
│   ├── supabase/{client,server}.ts
│   └── validation.ts                # schémas Zod (E.164, etc.)
└── middleware.ts                    # refresh session Supabase

supabase/migrations/                 # schéma, RLS, fonction join_theme
```

## Matching atomique

La fonction Postgres `join_theme(p_theme_id)` (voir
`supabase/migrations/0003_join_theme_function.sql`) utilise
`pg_advisory_xact_lock` pour sérialiser les inscriptions concurrentes sur un
même thème : jamais plus de 8 personnes dans un cercle, quel que soit le
nombre d'appels simultanés.
