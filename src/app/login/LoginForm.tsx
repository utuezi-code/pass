"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Se connecter</h1>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
          />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-md bg-foreground px-4 py-2 font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="text-center text-sm text-foreground/60">
        Pas encore de compte ?{" "}
        <Link href="/register" className="underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
