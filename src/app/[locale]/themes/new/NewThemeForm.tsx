"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { localizeCategoryTitle } from "@/lib/category-i18n";
import { createThemeAction, type CreateThemeState } from "./actions";

const initialState: CreateThemeState = {};

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-neutral-50 placeholder:text-neutral-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

export default function NewThemeForm({
  categories,
  locale,
}: {
  categories: { id: string; title: string; emoji: string }[];
  locale: string;
}) {
  const [state, formAction, isPending] = useActionState(createThemeAction, initialState);
  const t = useTranslations("themesNew");

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="categoryId" className="text-sm font-medium text-neutral-300">
          {t("category")}
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue=""
          className={`bg-neutral-900 ${inputClass}`}
        >
          <option value="" disabled>
            {t("categoryPlaceholder")}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {localizeCategoryTitle(c.title, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-neutral-300">
          {t("titleLabel")}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          placeholder={t("titlePlaceholder")}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-neutral-300">
          {t("description")}
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          placeholder={t("descriptionPlaceholder")}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="scheduledAt" className="text-sm font-medium text-neutral-300">
          {t("scheduledAt")}
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
        {isPending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
