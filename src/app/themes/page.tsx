import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EmberRing from "@/components/EmberRing";
import JoinThemeButton from "@/components/JoinThemeButton";
import ThemeFilters from "@/components/ThemeFilters";
import AppHeader from "@/components/AppHeader";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Échappe les caractères qui casseraient la syntaxe de filtre PostgREST (.or())
function sanitizeSearch(q: string) {
  return q.replace(/[,()%_]/g, " ").trim().slice(0, 100);
}

export default async function ThemesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let themesQuery = supabase
    .from("themes")
    .select("id, title, description, scheduled_at, capacity, status, category_id")
    .in("status", ["open", "confirmed"])
    .order("scheduled_at", { ascending: true });

  if (category) {
    themesQuery = themesQuery.eq("category_id", category);
  }

  const keyword = q ? sanitizeSearch(q) : "";
  if (keyword) {
    themesQuery = themesQuery.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  }

  const [{ data: categories }, { data: themes }, { data: counts }, { data: myRegistrations }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("active", true).order("title"),
      themesQuery,
      supabase.from("theme_counts").select("theme_id, waiting_count"),
      user
        ? supabase.from("registrations").select("theme_id, circle_id").eq("user_id", user.id)
        : Promise.resolve({ data: [] as { theme_id: string; circle_id: string | null }[] }),
    ]);

  const countByTheme = new Map((counts ?? []).map((c) => [c.theme_id, c.waiting_count]));
  const registrationByTheme = new Map((myRegistrations ?? []).map((r) => [r.theme_id, r]));
  const themesByCategory = new Map<string, typeof themes>();
  for (const theme of themes ?? []) {
    const list = themesByCategory.get(theme.category_id) ?? [];
    list.push(theme);
    themesByCategory.set(theme.category_id, list);
  }

  const hasFilters = !!category || !!keyword;

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-2xl p-4 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-50">Thèmes</h1>
            <p className="mt-1 text-neutral-400">
              Rejoignez un thème avant sa date. Dès que 8 personnes sont réunies, un cercle se
              forme.
            </p>
          </div>
          <Link
            href={user ? "/themes/new" : "/login?next=/themes/new"}
            className="shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:shadow-orange-900/50"
          >
            Proposer un thème
          </Link>
        </div>

        <div className="mt-6">
          <ThemeFilters categories={categories ?? []} />
        </div>

        <div className="mt-8 flex flex-col gap-10">
          {(categories ?? []).map((cat) => {
            const categoryThemes = themesByCategory.get(cat.id) ?? [];
            // Sous filtre actif, on ne montre que les catégories avec des résultats.
            // Sans filtre, on garde toutes les catégories visibles (avec une invitation
            // à proposer) pour que le site ne paraisse jamais vide.
            if (categoryThemes.length === 0 && hasFilters) return null;

            return (
              <section key={cat.id}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-50">
                  <span>{cat.emoji}</span> {cat.title}
                </h2>
                {categoryThemes.length === 0 ? (
                  <Link
                    href={user ? "/themes/new" : "/login?next=/themes/new"}
                    className="block rounded-2xl border border-dashed border-white/10 p-4 text-sm text-neutral-500 transition hover:border-orange-500/40 hover:text-orange-400"
                  >
                    Aucun thème ici pour l&apos;instant — soyez le premier à en proposer un →
                  </Link>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {categoryThemes.map((theme) => {
                      const registration = registrationByTheme.get(theme.id);
                      return (
                        <li
                          key={theme.id}
                          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <EmberRing
                              themeId={theme.id}
                              capacity={theme.capacity}
                              initialCount={countByTheme.get(theme.id) ?? 0}
                            />
                            <div className="min-w-0">
                              <p className="font-medium break-words text-neutral-50">
                                {theme.title}
                              </p>
                              <p className="text-sm text-neutral-400 break-words">
                                {theme.description}
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                {formatDate(theme.scheduled_at)}
                              </p>
                            </div>
                          </div>
                          <JoinThemeButton
                            themeId={theme.id}
                            alreadyJoined={!!registration}
                            matched={!!registration?.circle_id}
                            isAuthenticated={!!user}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}

          {hasFilters && (themes ?? []).length === 0 && (
            <p className="text-neutral-400">
              Aucun thème ne correspond.{" "}
              <Link
                href={user ? "/themes/new" : "/login?next=/themes/new"}
                className="text-orange-400 hover:underline"
              >
                Proposez-en un
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
