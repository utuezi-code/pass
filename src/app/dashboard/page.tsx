import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import ReportButton from "@/components/ReportButton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: registrations }, { data: myThemes }] = await Promise.all([
    supabase
      .from("registrations")
      .select(
        "id, created_at, theme:themes(title, scheduled_at, category:categories(emoji)), circle:circles(id, meeting_url, status)",
      )
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("themes")
      .select("id, title, scheduled_at, status, category:categories(emoji)")
      .eq("creator_id", user!.id)
      .order("scheduled_at", { ascending: false }),
  ]);

  const circleIds = (registrations ?? [])
    .map((r) => r.circle?.id)
    .filter((id): id is string => !!id);

  const { data: circleMembers } =
    circleIds.length > 0
      ? await supabase
          .from("registrations")
          .select("circle_id, user_id, profile:profiles(full_name)")
          .in("circle_id", circleIds)
      : { data: [] as { circle_id: string | null; user_id: string; profile: { full_name: string } | null }[] };

  const membersByCircle = new Map<string, { user_id: string; full_name: string }[]>();
  for (const m of circleMembers ?? []) {
    if (!m.circle_id || m.user_id === user!.id) continue;
    const list = membersByCircle.get(m.circle_id) ?? [];
    list.push({ user_id: m.user_id, full_name: m.profile?.full_name ?? "Un membre" });
    membersByCircle.set(m.circle_id, list);
  }

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-2xl p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-neutral-50">Mon tableau de bord</h1>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-neutral-50">Mes inscriptions</h2>

          {(!registrations || registrations.length === 0) && (
            <p className="text-neutral-400">
              Vous n&apos;avez rejoint aucun thème pour le moment.{" "}
              <Link href="/themes" className="text-orange-400 hover:underline">
                Voir les thèmes
              </Link>
              .
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {registrations?.map((r) => {
              const members = r.circle?.id ? membersByCircle.get(r.circle.id) : undefined;
              return (
                <li
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="font-medium break-words text-neutral-50">
                    {r.theme?.category?.emoji} {r.theme?.title}
                  </p>
                  {r.theme?.scheduled_at && (
                    <p className="text-xs text-neutral-500">
                      {formatDate(r.theme.scheduled_at)}
                    </p>
                  )}
                  {r.circle?.meeting_url ? (
                    <>
                      <Link
                        href={`/circle/${r.circle.id}`}
                        className="mt-3 block rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:shadow-orange-900/50 sm:inline-block"
                      >
                        Rejoindre la visio
                      </Link>

                      {members && members.length > 0 && (
                        <div className="mt-4 border-t border-white/10 pt-3">
                          <p className="text-xs font-medium text-neutral-400">
                            Membres du cercle
                          </p>
                          <ul className="mt-2 flex flex-col gap-2">
                            {members.map((m) => (
                              <li key={m.user_id} className="flex items-center justify-between gap-3">
                                <span className="text-sm text-neutral-300">{m.full_name}</span>
                                <ReportButton
                                  reportedId={m.user_id}
                                  circleId={r.circle!.id}
                                  reportedName={m.full_name}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-neutral-400">
                      En attente que le cercle se forme (8 personnes)…
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-neutral-50">Mes thèmes proposés</h2>

          {(!myThemes || myThemes.length === 0) && (
            <p className="text-neutral-400">
              Vous n&apos;avez proposé aucun thème.{" "}
              <Link href="/themes/new" className="text-orange-400 hover:underline">
                En proposer un
              </Link>
              .
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {myThemes?.map((t) => (
              <li
                key={t.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="font-medium break-words text-neutral-50">
                  {t.category?.emoji} {t.title}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatDate(t.scheduled_at)} · {t.status}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
