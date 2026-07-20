import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

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
        "id, created_at, theme:themes(title, scheduled_at, category:categories(emoji)), circle:circles(meeting_url, status)",
      )
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("themes")
      .select("id, title, scheduled_at, status, category:categories(emoji)")
      .eq("creator_id", user!.id)
      .order("scheduled_at", { ascending: false }),
  ]);

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">Mon tableau de bord</h1>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-medium">Mes inscriptions</h2>

        {(!registrations || registrations.length === 0) && (
          <p className="text-foreground/60">
            Vous n&apos;avez rejoint aucun thème pour le moment.{" "}
            <Link href="/themes" className="underline">
              Voir les thèmes
            </Link>
            .
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {registrations?.map((r) => (
            <li key={r.id} className="rounded-lg border border-foreground/10 p-4">
              <p className="font-medium">
                {r.theme?.category?.emoji} {r.theme?.title}
              </p>
              {r.theme?.scheduled_at && (
                <p className="text-xs text-foreground/50">{formatDate(r.theme.scheduled_at)}</p>
              )}
              {r.circle?.meeting_url ? (
                <a
                  href={r.circle.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white"
                >
                  Rejoindre la visio
                </a>
              ) : (
                <p className="mt-1 text-sm text-foreground/60">
                  En attente que le cercle se forme (8 personnes)…
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-medium">Mes thèmes proposés</h2>

          {(!myThemes || myThemes.length === 0) && (
            <p className="text-foreground/60">
              Vous n&apos;avez proposé aucun thème.{" "}
              <Link href="/themes/new" className="underline">
                En proposer un
              </Link>
              .
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {myThemes?.map((t) => (
              <li key={t.id} className="rounded-lg border border-foreground/10 p-4">
                <p className="font-medium">
                  {t.category?.emoji} {t.title}
                </p>
                <p className="text-xs text-foreground/50">
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
