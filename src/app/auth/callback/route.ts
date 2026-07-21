import { NextResponse, type NextRequest } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { describeProfileInsertError } from "@/lib/profile-errors";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/themes";
  const locale = await getLocale();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Complète le profil si absent (cas email non auto-confirmé à l'inscription)
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

          if (profileError) {
            const tActions = await getTranslations("actions");
            const message = describeProfileInsertError(profileError, tActions);
            if (message) {
              await supabase.auth.signOut();
              const conflictUrl = new URL(getPathname({ href: "/", locale }), origin);
              conflictUrl.searchParams.set("error_description", message);
              return NextResponse.redirect(conflictUrl);
            }
          }
        }
      }

      const nextPathname = getPathname({ href: next, locale });
      return NextResponse.redirect(new URL(nextPathname, origin));
    }
  }

  const loginPathname = getPathname({ href: "/login", locale });
  const failedUrl = new URL(loginPathname, origin);
  failedUrl.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(failedUrl);
}
