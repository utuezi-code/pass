"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthErrorBanner() {
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.hash ? window.location.hash.slice(1) : window.location.search,
    );
    const errorDescription = params.get("error_description");
    if (errorDescription) {
      setDescription(errorDescription.replace(/\+/g, " "));
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  if (!description) return null;

  return (
    <div className="mx-auto mb-6 max-w-md rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm">
      <p>Lien invalide ou expiré : {description}</p>
      <p className="mt-1">
        <Link href="/register" className="underline">
          Réessayez de vous inscrire
        </Link>{" "}
        ou{" "}
        <Link href="/login" className="underline">
          connectez-vous
        </Link>
        .
      </p>
    </div>
  );
}
