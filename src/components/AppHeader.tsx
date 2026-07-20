import Link from "next/link";
import { logoutAction } from "@/app/logout/actions";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 text-sm sm:px-8">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link href="/themes" className="flex items-center gap-1.5 font-bold text-neutral-50">
            <span>🔥</span> Wiclos
          </Link>
          <Link href="/themes" className="text-neutral-400 transition hover:text-orange-400">
            Thèmes
          </Link>
          <Link href="/dashboard" className="text-neutral-400 transition hover:text-orange-400">
            Mon dashboard
          </Link>
        </nav>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-white/10 px-3 py-1.5 text-neutral-400 transition hover:border-white/20 hover:text-neutral-50"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </header>
  );
}
