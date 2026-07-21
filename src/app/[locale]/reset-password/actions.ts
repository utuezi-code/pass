"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createResetPasswordSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export type ResetPasswordState = {
  error?: string;
};

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const [tValidation, tActions, locale] = await Promise.all([
    getTranslations("validation"),
    getTranslations("actions"),
    getLocale(),
  ]);

  const parsed = createResetPasswordSchema(tValidation).safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? tValidation("genericForm") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: tActions("resetPasswordFailed") };
  }

  return redirect({ href: "/themes", locale });
}
