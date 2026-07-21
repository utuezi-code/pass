"use server";

import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createRegisterSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { describeProfileInsertError } from "@/lib/profile-errors";

export type RegisterState = {
  error?: string;
  checkEmail?: boolean;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const [tValidation, tActions, locale] = await Promise.all([
    getTranslations("validation"),
    getTranslations("actions"),
    getLocale(),
  ]);

  const parsed = createRegisterSchema(tValidation).safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    whatsappNumber: formData.get("whatsappNumber"),
    inviteCode: formData.get("inviteCode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? tValidation("genericForm") };
  }

  const { fullName, email, password, whatsappNumber, inviteCode } = parsed.data;
  const whatsappConsent = formData.get("whatsappConsent") === "on";
  const supabase = await createClient();

  const { data: inviteOnlyConfig } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "invite_only_mode")
    .maybeSingle();

  if (inviteOnlyConfig?.value === true) {
    const { data: codeValid } = await supabase.rpc("consume_invite_code", {
      p_code: inviteCode ?? "",
    });
    if (!codeValid) {
      return { error: tActions("inviteCodeInvalid") };
    }
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        whatsapp_number: whatsappNumber ?? null,
        whatsapp_consent: whatsappNumber ? whatsappConsent : false,
      },
      emailRedirectTo: `${protocol}://${host}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: tActions("registerFailed") };
  }

  // Si l'auto-confirmation est activée sur le projet Supabase, une session
  // est déjà ouverte ici : on peut créer le profil tout de suite. Sinon, le
  // profil sera créé au retour de /auth/callback après confirmation email.
  if (data.session) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      whatsapp_number: whatsappNumber ?? null,
      notification_channel: whatsappNumber ? "whatsapp" : "email",
      consent_given_at: whatsappNumber && whatsappConsent ? new Date().toISOString() : null,
    });

    if (profileError) {
      const message = describeProfileInsertError(profileError, tActions);
      if (message) {
        return { error: message };
      }
    }

    redirect({ href: "/themes", locale });
  }

  return { checkEmail: true };
}
