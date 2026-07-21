"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AuthErrorBanner() {
  const [description, setDescription] = useState<string | null>(null);
  const t = useTranslations("authErrorBanner");

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
      <p>
        {t("prefix")}
        {description}
      </p>
      <p className="mt-1">
        <Link href="/register" className="underline">
          {t("retryRegister")}
        </Link>{" "}
        {t("or")}{" "}
        <Link href="/login" className="underline">
          {t("login")}
        </Link>
        .
      </p>
    </div>
  );
}
