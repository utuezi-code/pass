"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

export default function ThemeFilters({
  categories,
}: {
  categories: { id: string; title: string; emoji: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(next: { category?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/themes${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateParams({ category: e.target.value })}
        className="rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.emoji} {c.title}
          </option>
        ))}
      </select>

      <input
        type="search"
        placeholder="Rechercher un mot-clé…"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => updateParams({ q: value }), 300);
        }}
        className="flex-1 rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm"
      />
    </div>
  );
}
