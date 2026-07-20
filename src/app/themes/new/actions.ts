"use server";

import { redirect } from "next/navigation";
import { createThemeSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export type CreateThemeState = {
  error?: string;
};

export async function createThemeAction(
  _prevState: CreateThemeState,
  formData: FormData,
): Promise<CreateThemeState> {
  const parsed = createThemeSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    description: formData.get("description"),
    scheduledAt: formData.get("scheduledAt"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté." };
  }

  const { categoryId, title, description, scheduledAt } = parsed.data;

  const { data: theme, error } = await supabase
    .from("themes")
    .insert({
      category_id: categoryId,
      creator_id: user.id,
      title,
      description,
      scheduled_at: new Date(scheduledAt).toISOString(),
    })
    .select("id")
    .single();

  if (error || !theme) {
    return { error: "Impossible de créer le thème : " + (error?.message ?? "erreur inconnue") };
  }

  // Le créateur rejoint automatiquement son propre thème
  await supabase.rpc("join_theme", { p_theme_id: theme.id });

  redirect("/themes");
}
