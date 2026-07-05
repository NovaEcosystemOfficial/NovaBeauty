"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(navigatorWithStandalone.standalone);
}

function isIosSafari() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent);
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const showIosHint = useMemo(() => isIosSafari() && !isStandalone(), []);

  useEffect(() => {
    setInstalled(isStandalone());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setInstalled(true);
    }

    setInstallEvent(null);
  }

  if (installed || dismissed || (!installEvent && !showIosHint)) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-md rounded-beauty-lg border border-beauty-border/70 bg-beauty-elevated/95 p-4 shadow-beauty-floating backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-beauty bg-beauty-primary/12 text-beauty-primary">
          {showIosHint ? <Share className="size-5" aria-hidden="true" /> : <Download className="size-5" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-beauty-text">Installa NovaBeauty</p>
          <p className="mt-1 text-[12px] leading-5 text-beauty-muted">
            {showIosHint
              ? "Su iPhone usa Condividi e poi Aggiungi alla Home."
              : "Aggiungi l'app alla schermata iniziale per usarla come gestionale."}
          </p>
          <div className="mt-3 flex gap-2">
            {installEvent ? (
              <SecondaryButton type="button" onClick={handleInstall} className="h-10">
                Installa
              </SecondaryButton>
            ) : null}
            <button
              type="button"
              className="h-10 rounded-beauty px-3 text-[13px] font-semibold text-beauty-muted transition hover:bg-beauty-card hover:text-beauty-text"
              onClick={() => setDismissed(true)}
            >
              Non ora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
