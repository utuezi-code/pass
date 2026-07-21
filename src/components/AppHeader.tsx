import { getTranslations } from "next-intl/server";
import { logoutAction } from "@/app/[locale]/logout/actions";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 text-sm sm:px-8">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link href="/" className="flex items-center gap-1.5 font-bold text-neutral-50">
            <span>🔥</span> {t("brand")}
          </Link>
          <Link href="/themes" className="text-neutral-400 transition hover:text-orange-400">
            {t("themes")}
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="text-neutral-400 transition hover:text-orange-400"
            >
              {t("dashboard")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {user ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-white/10 px-3 py-1.5 text-neutral-400 transition hover:border-white/20 hover:text-neutral-50"
              >
                {t("logout")}
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-neutral-400 transition hover:text-neutral-50"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:shadow-orange-900/50"
              >
                {t("register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
