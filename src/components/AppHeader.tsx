import Link from "next/link";
import { logoutAction } from "@/app/logout/actions";

export default function AppHeader() {
  return (
    <header className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-4 text-sm sm:px-8 sm:pt-8">
      <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link href="/themes" className="font-semibold">
          🔥 Wiclos
        </Link>
        <Link href="/themes" className="text-foreground/60 hover:text-foreground">
          Thèmes
        </Link>
        <Link href="/dashboard" className="text-foreground/60 hover:text-foreground">
          Mon dashboard
        </Link>
      </nav>
      <form action={logoutAction}>
        <button type="submit" className="text-foreground/60 underline hover:text-foreground">
          Se déconnecter
        </button>
      </form>
    </header>
  );
}
