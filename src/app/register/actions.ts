"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { registerSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = {
  error?: string;
  checkEmail?: boolean;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    whatsappNumber: formData.get("whatsappNumber"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const { fullName, email, password, whatsappNumber } = parsed.data;
  const supabase = await createClient();

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, whatsapp_number: whatsappNumber },
      emailRedirectTo: `${protocol}://${host}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Inscription impossible, réessayez." };
  }

  // Si l'auto-confirmation est activée sur le projet Supabase, une session
  // est déjà ouverte ici : on peut créer le profil tout de suite. Sinon, le
  // profil sera créé au retour de /auth/callback après confirmation email.
  if (data.session) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      whatsapp_number: whatsappNumber,
    });

    if (profileError && profileError.code !== "23505") {
      return { error: "Compte créé mais profil incomplet : " + profileError.message };
    }

    redirect("/themes");
  }

  return { checkEmail: true };
}
