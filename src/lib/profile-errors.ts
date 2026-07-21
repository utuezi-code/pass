import type { PostgrestError } from "@supabase/supabase-js";

type T = (key: string) => string;

/**
 * Un conflit sur profiles.id (déjà existant pour cet utilisateur) est un
 * no-op bénin, courant sur les chemins idempotents (callback, login
 * fallback). Un conflit sur whatsapp_number veut dire que ce numéro est
 * déjà associé à un autre compte — ça doit être remonté à l'utilisateur.
 */
export function describeProfileInsertError(error: PostgrestError, t: T): string | null {
  if (error.code !== "23505") {
    return t("profileIncomplete") + error.message;
  }

  if (error.message.includes("whatsapp_number")) {
    return t("whatsappTaken");
  }

  return null;
}
