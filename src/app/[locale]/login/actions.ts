"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createLoginSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { describeProfileInsertError } from "@/lib/profile-errors";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const [tValidation, tActions, locale] = await Promise.all([
    getTranslations("validation"),
    getTranslations("actions"),
    getLocale(),
  ]);

  const parsed = createLoginSchema(tValidation).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? tValidation("genericForm") };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: tActions("loginWrongCredentials") };
  }

  // Filet de sécurité : si la création du profil a échoué au moment de la
  // confirmation email (ex: redirect_to pas encore autorisé côté Supabase),
  // on la retente ici à partir des métadonnées enregistrées à l'inscription.
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!existingProfile) {
    const metadata = data.user.user_metadata as {
      full_name?: string;
      whatsapp_number?: string | null;
      whatsapp_consent?: boolean;
    };

    if (metadata.full_name) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: metadata.full_name,
        whatsapp_number: metadata.whatsapp_number ?? null,
        notification_channel: metadata.whatsapp_number ? "whatsapp" : "email",
        consent_given_at:
          metadata.whatsapp_number && metadata.whatsapp_consent
            ? new Date().toISOString()
            : null,
      });

      // Un compte confirmé sans profil (ex: whatsapp_number pris par un
      // autre compte au moment de la confirmation) ne doit pas pouvoir se
      // connecter dans un état cassé : le reste de l'app suppose qu'un
      // utilisateur authentifié a toujours une ligne `profiles`.
      if (profileError) {
        const message = describeProfileInsertError(profileError, tActions);
        if (message) {
          await supabase.auth.signOut();
          return { error: message };
        }
      }
    }
  }

  const next = formData.get("next");
  const isSafeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//");
  return redirect({ href: isSafeNext ? next : "/themes", locale });
}
