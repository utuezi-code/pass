"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinThemeButton({
  themeId,
  alreadyJoined,
  matched,
  circleId,
  isAuthenticated,
}: {
  themeId: string;
  alreadyJoined: boolean;
  matched: boolean;
  circleId?: string | null;
  isAuthenticated: boolean;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(alreadyJoined);
  const [matchedCircleId, setMatchedCircleId] = useState<string | null>(circleId ?? null);
  const router = useRouter();
  const t = useTranslations("joinThemeButton");

  if (matched) {
    return (
      <button
        type="button"
        onClick={() => router.push(matchedCircleId ? `/circle/${matchedCircleId}` : "/dashboard")}
        className="w-full whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:shadow-orange-900/50 sm:w-auto"
      >
        {t("viewCircle")}
      </button>
    );
  }

  if (joined) {
    return (
      <span className="block w-full whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-center text-sm text-neutral-400 sm:w-auto">
        {t("waiting")}
      </span>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?next=/themes`}
        className="block w-full whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-center text-sm font-semibold text-neutral-50 transition hover:border-orange-500 hover:text-orange-400 sm:w-auto"
      >
        {t("loginToJoin")}
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
      setError(
        rpcError.message.includes("account_suspended")
          ? t("suspendedError")
          : t("genericError"),
      );
      return;
    }

    setJoined(true);

    if (data?.status === "matched" && data.circle_id) {
      setMatchedCircleId(data.circle_id);
      router.push(`/circle/${data.circle_id}`);
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
        {isPending ? "…" : t("join")}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
