"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinThemeButton({
  themeId,
  alreadyJoined,
  matched,
}: {
  themeId: string;
  alreadyJoined: boolean;
  matched: boolean;
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
        className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white"
      >
        Voir mon cercle
      </button>
    );
  }

  if (joined) {
    return (
      <span className="rounded-md border border-foreground/20 px-4 py-2 text-sm text-foreground/60">
        En attente…
      </span>
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
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleJoin}
        disabled={isPending}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {isPending ? "…" : "Rejoindre"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
