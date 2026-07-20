"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-neutral-50 placeholder:text-neutral-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [phone, setPhone] = useState<string | undefined>();

  if (state.checkEmail) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-4 text-center sm:p-8">
        <span className="text-5xl">🔥</span>
        <h1 className="text-2xl font-bold text-neutral-50">Vérifiez votre email</h1>
        <p className="text-neutral-400">
          Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre
          compte.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-4 sm:p-8">
      <div className="text-center">
        <span className="text-4xl">🔥</span>
        <h1 className="mt-3 text-2xl font-bold text-neutral-50">Créer un compte</h1>
        <p className="mt-1 text-neutral-400">Rejoignez un cercle en quelques secondes.</p>
      </div>

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-sm font-medium text-neutral-300">
            Nom complet
          </label>
          <input id="fullName" name="fullName" type="text" required className={inputClass} />
        </div>

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
            minLength={8}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="whatsappNumber" className="text-sm font-medium text-neutral-300">
            Numéro WhatsApp
          </label>
          <PhoneInput
            id="whatsappNumber"
            international
            value={phone}
            onChange={setPhone}
            className={`phone-input-dark ${inputClass}`}
          />
          <input type="hidden" name="whatsappNumber" value={phone ?? ""} />
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:shadow-orange-900/50 disabled:opacity-50"
        >
          {isPending ? "Création…" : "Créer mon compte"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-400">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-orange-400 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
