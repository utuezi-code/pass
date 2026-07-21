import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Un conflit sur profiles.id (déjà existant pour cet utilisateur) est un
 * no-op bénin, courant sur les chemins idempotents (callback, login
 * fallback). Un conflit sur whatsapp_number veut dire que ce numéro est
 * déjà associé à un autre compte — ça doit être remonté à l'utilisateur.
 */
export function describeProfileInsertError(error: PostgrestError): string | null {
  if (error.code !== "23505") {
    return "Compte créé mais profil incomplet : " + error.message;
  }

  if (error.message.includes("whatsapp_number")) {
    return "Ce numéro WhatsApp est déjà associé à un compte.";
  }

  return null;
}
