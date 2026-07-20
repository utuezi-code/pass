"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-neutral-50 placeholder:text-neutral-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-4 sm:p-8">
      <div className="text-center">
        <span className="text-4xl">🔥</span>
        <h1 className="mt-3 text-2xl font-bold text-neutral-50">Se connecter</h1>
      </div>

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-neutral-300">
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-neutral-300">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={inputClass}
          />
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:shadow-orange-900/50 disabled:opacity-50"
        >
          {isPending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-400">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-orange-400 hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
