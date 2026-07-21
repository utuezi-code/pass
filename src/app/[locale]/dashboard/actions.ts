"use server";

import { getTranslations } from "next-intl/server";
import { createReportUserSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export type ReportState = {
  error?: string;
  success?: boolean;
};

export async function reportUserAction(
  _prevState: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const [tValidation, tActions] = await Promise.all([
    getTranslations("validation"),
    getTranslations("actions"),
  ]);

  const parsed = createReportUserSchema(tValidation).safeParse({
    reportedId: formData.get("reportedId"),
    circleId: formData.get("circleId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? tValidation("genericForm") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: tActions("mustBeLoggedIn") };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: parsed.data.reportedId,
    circle_id: parsed.data.circleId,
    reason: parsed.data.reason,
  });

  if (error) {
    return { error: tActions("reportFailed") };
  }

  return { success: true };
}
