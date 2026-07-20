import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/logout/actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, created_at, theme:themes(title, emoji), circle:circles(meeting_url, status)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mon tableau de bord</h1>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-foreground/60 underline">
            Se déconnecter
          </button>
        </form>
      </div>

      {(!registrations || registrations.length === 0) && (
        <p className="mt-6 text-foreground/60">
          Vous n&apos;avez rejoint aucun thème pour le moment.{" "}
          <Link href="/themes" className="underline">
            Voir les thèmes
          </Link>
          .
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {registrations?.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-foreground/10 p-4"
          >
            <p className="font-medium">
              {r.theme?.emoji} {r.theme?.title}
            </p>
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
    </div>
  );
}
