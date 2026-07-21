"use server";

import { reportUserSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export type ReportState = {
  error?: string;
  success?: boolean;
};

export async function reportUserAction(
  _prevState: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const parsed = reportUserSchema.safeParse({
    reportedId: formData.get("reportedId"),
    circleId: formData.get("circleId"),
    reason: formData.get("reason"),
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

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: parsed.data.reportedId,
    circle_id: parsed.data.circleId,
    reason: parsed.data.reason,
  });

  if (error) {
    return { error: "Impossible d'envoyer le signalement pour le moment." };
  }

  return { success: true };
}
