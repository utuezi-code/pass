"use client";

import { useActionState } from "react";
import { createThemeAction, type CreateThemeState } from "./actions";

const initialState: CreateThemeState = {};

export default function NewThemeForm({
  categories,
}: {
  categories: { id: string; title: string; emoji: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createThemeAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="categoryId" className="text-sm font-medium">
          Catégorie
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue=""
          className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
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

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
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
          className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
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
          className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="scheduledAt" className="text-sm font-medium">
          Date et heure de l&apos;échange
        </label>
        <input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
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
        {isPending ? "Création…" : "Proposer ce thème"}
      </button>
    </form>
  );
}
