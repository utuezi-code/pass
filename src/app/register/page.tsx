"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [phone, setPhone] = useState<string | undefined>();

  if (state.checkEmail) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-semibold">Vérifiez votre email</h1>
        <p className="text-foreground/70">
          Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre
          compte.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Créer un compte</h1>
        <p className="text-foreground/60">Rejoignez un cercle en quelques secondes.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="fullName" className="text-sm font-medium">
            Nom complet
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
          />
        </div>

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
            minLength={8}
            className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="whatsappNumber" className="text-sm font-medium">
            Numéro WhatsApp
          </label>
          <PhoneInput
            id="whatsappNumber"
            international
            value={phone}
            onChange={setPhone}
            className="rounded-md border border-foreground/20 px-3 py-2"
          />
          <input type="hidden" name="whatsappNumber" value={phone ?? ""} />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-md bg-foreground px-4 py-2 font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Création…" : "Créer mon compte"}
        </button>
      </form>

      <p className="text-center text-sm text-foreground/60">
        Déjà inscrit ?{" "}
        <Link href="/login" className="underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
