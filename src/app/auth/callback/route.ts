import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: metadata.full_name,
            whatsapp_number: metadata.whatsapp_number,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
