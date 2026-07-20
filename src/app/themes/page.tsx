import { createClient } from "@/lib/supabase/server";
import EmberRing from "@/components/EmberRing";
import JoinThemeButton from "@/components/JoinThemeButton";

export default async function ThemesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: themes }, { data: counts }, { data: myRegistrations }] = await Promise.all([
    supabase.from("themes").select("*").eq("active", true).order("created_at"),
    supabase.from("theme_counts").select("theme_id, waiting_count"),
    user
      ? supabase.from("registrations").select("theme_id, circle_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { theme_id: string; circle_id: string | null }[] }),
  ]);

  const countByTheme = new Map((counts ?? []).map((c) => [c.theme_id, c.waiting_count]));
  const registrationByTheme = new Map((myRegistrations ?? []).map((r) => [r.theme_id, r]));

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Thèmes</h1>
      <p className="mt-1 text-foreground/60">
        Rejoignez un thème. Dès que 8 personnes sont réunies, un cercle se forme.
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {(themes ?? []).map((theme) => {
          const registration = registrationByTheme.get(theme.id);
          return (
            <li
              key={theme.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-foreground/10 p-4"
            >
              <div className="flex items-center gap-4">
                <EmberRing
                  themeId={theme.id}
                  capacity={8}
                  initialCount={countByTheme.get(theme.id) ?? 0}
                />
                <div>
                  <p className="font-medium">
                    {theme.emoji} {theme.title}
                  </p>
                  <p className="text-sm text-foreground/60">{theme.description}</p>
                </div>
              </div>
              <JoinThemeButton
                themeId={theme.id}
                alreadyJoined={!!registration}
                matched={!!registration?.circle_id}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
