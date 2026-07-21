"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { localizeCategoryTitle } from "@/lib/category-i18n";

export default function ThemeFilters({
  categories,
  locale,
}: {
  categories: { id: string; title: string; emoji: string }[];
  locale: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations("themeFilters");

  function updateParams(next: { category?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateParams({ category: e.target.value })}
        className="rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-neutral-50 outline-none transition focus:border-orange-500"
      >
        <option value="">{t("allCategories")}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.emoji} {localizeCategoryTitle(c.title, locale)}
          </option>
        ))}
      </select>

      <input
        type="search"
        placeholder={t("searchPlaceholder")}
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => updateParams({ q: value }), 300);
        }}
        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-50 placeholder:text-neutral-500 outline-none transition focus:border-orange-500"
      />
    </div>
  );
}
