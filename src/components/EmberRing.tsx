"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EmberRing({
  themeId,
  capacity,
  initialCount,
}: {
  themeId: string;
  capacity: number;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`theme-counts-${themeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "theme_counts",
          filter: `theme_id=eq.${themeId}`,
        },
        (payload) => {
          const row = payload.new as { waiting_count?: number } | null;
          if (row && typeof row.waiting_count === "number") {
            setCount(row.waiting_count);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [themeId]);

  const ratio = Math.min(count / capacity, 1);
  const circumference = 2 * Math.PI * 18;

  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 40 40" className="h-14 w-14 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          strokeWidth="3"
          className="stroke-foreground/15"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          stroke="#f97316"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {count}/{capacity}
      </span>
    </div>
  );
}
