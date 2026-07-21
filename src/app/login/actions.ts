"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
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
      whatsapp_number?: string;
    };

    if (metadata.full_name && metadata.whatsapp_number) {
      // Best-effort : un conflit ici (numéro déjà pris entre-temps par un
      // autre compte) laisse simplement le profil incomplet plutôt que de
      // faire échouer une connexion par ailleurs valide.
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: metadata.full_name,
        whatsapp_number: metadata.whatsapp_number,
      });
    }
  }

  const next = formData.get("next");
  const isSafeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//");
  redirect(isSafeNext ? next : "/themes");
}
