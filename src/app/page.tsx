import Link from "next/link";
import AuthErrorBanner from "@/components/AuthErrorBanner";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <AuthErrorBanner />
      <div className="flex flex-col gap-3">
        <span className="text-5xl">🔥</span>
        <h1 className="text-4xl font-semibold tracking-tight">Cercle</h1>
        <p className="max-w-md text-foreground/60">
          Choisissez un thème. Dès que 8 personnes vous rejoignent, un cercle se forme
          automatiquement et vous recevez le lien de la visio.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/register"
          className="rounded-md bg-foreground px-5 py-2.5 font-medium text-background"
        >
          Créer un compte
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-foreground/20 px-5 py-2.5 font-medium"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
