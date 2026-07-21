"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createForgotPasswordSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export type ForgotPasswordState = {
  error?: string;
  sent?: boolean;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const tValidation = await getTranslations("validation");

  const parsed = createForgotPasswordSchema(tValidation).safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? tValidation("genericForm") };
  }

  const supabase = await createClient();
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  // On ignore volontairement l'erreur retournée : révéler qu'un email n'a
  // pas de compte permettrait l'énumération des utilisateurs. Le même
  // message de succès est renvoyé que l'adresse existe ou non.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${protocol}://${host}/auth/callback?next=/reset-password`,
  });

  return { sent: true };
}
