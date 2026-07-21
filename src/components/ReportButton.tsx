"use client";

import { useActionState, useState } from "react";
import { reportUserAction, type ReportState } from "@/app/dashboard/actions";

const initialState: ReportState = {};

export default function ReportButton({
  reportedId,
  circleId,
  reportedName,
}: {
  reportedId: string;
  circleId: string;
  reportedName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(reportUserAction, initialState);

  if (state.success) {
    return <span className="text-xs text-neutral-500">Signalement envoyé, merci.</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-neutral-500 underline-offset-2 transition hover:text-red-400 hover:underline"
      >
        Signaler
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-3">
      <input type="hidden" name="reportedId" value={reportedId} />
      <input type="hidden" name="circleId" value={circleId} />
      <p className="text-xs text-neutral-400">Pourquoi signaler {reportedName} ?</p>
      <textarea
        name="reason"
        required
        minLength={5}
        maxLength={500}
        rows={2}
        placeholder="Décrivez ce qui s'est passé…"
        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-neutral-50 placeholder:text-neutral-500 outline-none focus:border-orange-500"
      />
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {isPending ? "…" : "Envoyer"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-400 hover:text-neutral-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
