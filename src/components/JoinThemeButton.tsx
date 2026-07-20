"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function JoinThemeButton({
  themeId,
  alreadyJoined,
  matched,
  isAuthenticated,
}: {
  themeId: string;
  alreadyJoined: boolean;
  matched: boolean;
  isAuthenticated: boolean;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(alreadyJoined);
  const router = useRouter();

  if (matched) {
    return (
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="w-full whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:shadow-orange-900/50 sm:w-auto"
      >
        Voir mon cercle
      </button>
    );
  }

  if (joined) {
    return (
      <span className="block w-full whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-center text-sm text-neutral-400 sm:w-auto">
        En attente…
      </span>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?next=/themes`}
        className="block w-full whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-center text-sm font-semibold text-neutral-50 transition hover:border-orange-500 hover:text-orange-400 sm:w-auto"
      >
        Se connecter pour rejoindre
      </Link>
    );
  }

  async function handleJoin() {
    setIsPending(true);
    setError(null);

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("join_theme", {
      p_theme_id: themeId,
    });

    setIsPending(false);

    if (rpcError) {
      setError("Impossible de rejoindre pour le moment.");
      return;
    }

    setJoined(true);

    if (data?.status === "matched") {
      router.push("/dashboard");
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        onClick={handleJoin}
        disabled={isPending}
        className="w-full whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-neutral-50 transition hover:border-orange-500 hover:text-orange-400 disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "…" : "Rejoindre"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
