import Link from "next/link";
import { logoutAction } from "@/app/logout/actions";

export default function AppHeader() {
  return (
    <header className="mx-auto flex max-w-2xl items-center justify-between px-8 pt-8 text-sm">
      <nav className="flex items-center gap-4">
        <Link href="/themes" className="font-semibold">
          🔥 Cercle
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
