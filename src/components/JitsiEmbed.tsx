"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: Record<string, unknown>,
    ) => {
      dispose: () => void;
      executeCommand: (command: string, ...args: unknown[]) => void;
    };
  }
}

const JITSI_DOMAIN = "meet.jit.si";

export default function JitsiEmbed({
  roomName,
  displayName,
}: {
  roomName: string;
  displayName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const t = useTranslations("jitsiEmbed");

  useEffect(() => {
    let api: InstanceType<NonNullable<Window["JitsiMeetExternalAPI"]>> | null = null;
    let cancelled = false;

    function init() {
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;

      api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        parentNode: containerRef.current,
        userInfo: { displayName },
        width: "100%",
        height: "100%",
        configOverwrite: {
          prejoinPageEnabled: true,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          MOBILE_APP_PROMO: false,
        },
      });

      setStatus("ready");
    }

    if (window.JitsiMeetExternalAPI) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.onload = init;
      script.onerror = () => setStatus("error");
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      api?.dispose();
    };
  }, [roomName, displayName]);

  if (status === "error") {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        {t("error")}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
          {t("connecting")}
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
