import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { describeProfileInsertError } from "@/lib/profile-errors";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/themes";

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
          whatsapp_number?: string;
        };

        if (metadata.full_name && metadata.whatsapp_number) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: metadata.full_name,
            whatsapp_number: metadata.whatsapp_number,
          });

          if (profileError) {
            const message = describeProfileInsertError(profileError);
            if (message) {
              await supabase.auth.signOut();
              const conflictUrl = new URL(origin);
              conflictUrl.searchParams.set("error_description", message);
              return NextResponse.redirect(conflictUrl);
            }
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
