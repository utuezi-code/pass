"use client";

import { useActionState } from "react";
import { createThemeAction, type CreateThemeState } from "./actions";

const initialState: CreateThemeState = {};

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-neutral-50 placeholder:text-neutral-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

export default function NewThemeForm({
  categories,
}: {
  categories: { id: string; title: string; emoji: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createThemeAction, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="categoryId" className="text-sm font-medium text-neutral-300">
          Catégorie
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue=""
          className={`bg-neutral-900 ${inputClass}`}
        >
          <option value="" disabled>
            Choisir une catégorie
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-neutral-300">
          Titre du thème
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          placeholder="Ex: Se relancer après un échec professionnel"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-neutral-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          placeholder="De quoi voulez-vous parler avec le cercle ?"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="scheduledAt" className="text-sm font-medium text-neutral-300">
          Date et heure de l&apos;échange
        </label>
        <input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
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
        {isPending ? "Création…" : "Proposer ce thème"}
      </button>
    </form>
  );
}
