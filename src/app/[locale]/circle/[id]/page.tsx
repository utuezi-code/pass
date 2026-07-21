import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import JitsiEmbed from "@/components/JitsiEmbed";

export default async function CirclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("circle");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: registration }, { data: profile }] = await Promise.all([
    supabase
      .from("registrations")
      .select("circle:circles(id, meeting_url), theme:themes(title)")
      .eq("user_id", user!.id)
      .eq("circle_id", id)
      .maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
  ]);

  if (!registration?.circle) {
    notFound();
  }

  const roomName = new URL(registration.circle.meeting_url).pathname.slice(1);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-50">
            {registration.theme?.title}
          </p>
          <p className="text-xs text-neutral-500">{t("yourCircle")}</p>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 text-sm text-neutral-400 transition hover:text-orange-400"
        >
          {t("backDashboard")}
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <JitsiEmbed roomName={roomName} displayName={profile?.full_name ?? t("guestName")} />
      </div>
    </div>
  );
}
