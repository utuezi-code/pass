-- Le numéro WhatsApp devient optionnel à l'inscription (il était collecté
-- systématiquement jusqu'ici). On ajoute un canal de notification déclaré
-- et une trace de consentement explicite (utile même sans envoi WhatsApp
-- actif aujourd'hui : ça prépare le terrain proprement, RGPD-like).
--
-- La contrainte unique sur whatsapp_number (0008) continue de fonctionner
-- avec des valeurs NULL : Postgres ne considère jamais deux NULL comme
-- égaux, donc plusieurs comptes peuvent avoir whatsapp_number = null sans
-- violer l'unicité — la protection anti-contournement de bannissement reste
-- intacte pour les comptes qui renseignent un numéro.

alter table public.profiles alter column whatsapp_number drop not null;

alter table public.profiles
  add column notification_channel text not null default 'email',
  add constraint profiles_notification_channel_check
    check (notification_channel in ('email', 'whatsapp', 'push')),
  add column consent_given_at timestamptz;

-- Un compte ne peut pas déclarer le canal "whatsapp" sans numéro renseigné.
alter table public.profiles
  add constraint profiles_whatsapp_channel_requires_number
    check (notification_channel <> 'whatsapp' or whatsapp_number is not null);
