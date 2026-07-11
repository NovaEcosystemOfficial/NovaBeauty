"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Card } from "@/components/ui/Card";
import { hasFirebaseVapidKey, isMessagingAvailable } from "@/lib/firebase/messaging";
import { routes } from "@/lib/constants/routes";
import { getAppPreferences, saveAppPreferences, type AppPreferences } from "@/lib/utils/app-preferences";

function getPushStatusLabel() {
  if (typeof window === "undefined" || !isMessagingAvailable() || !hasFirebaseVapidKey()) {
    return "Non attive";
  }

  if (Notification.permission === "granted") {
    return "Attive";
  }

  if (Notification.permission === "denied") {
    return "Bloccate";
  }

  return "Non attive";
}

export function AppSettings() {
  const [preferences, setPreferences] = useState<AppPreferences>({
    reduceAnimations: false,
    confirmBeforeDelete: true
  });
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
  const pushStatus = useMemo(() => getPushStatusLabel(), []);

  useEffect(() => {
    setPreferences(getAppPreferences());
  }, []);

  function updatePreference<Key extends keyof AppPreferences>(key: Key, value: AppPreferences[Key]) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    saveAppPreferences(next);
  }

  return (
    <div className="space-y-5">
      <SubpageHeader title="Impostazioni" subtitle="Preferenze dell'app e configurazione." backHref={routes.studio} />

      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-beauty-muted">Notifiche</h2>
        <Link href={routes.notifications} className="block">
          <Card className="flex items-center justify-between gap-3 p-4 transition hover:bg-beauty-card">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-beauty-primary/12 text-beauty-primary">
                <Bell className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-beauty-text">Centro notifiche</p>
                <p className="text-[13px] text-beauty-muted">Stato push: {pushStatus}</p>
              </div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-beauty-subtle" aria-hidden="true" />
          </Card>
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-beauty-muted">App</h2>
        <Card className="divide-y divide-beauty-border/70 p-0">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-[15px] font-semibold text-beauty-text">Versione</p>
              <p className="text-[13px] text-beauty-muted">NovaBeauty PWA {appVersion}</p>
            </div>
          </div>
          <label className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-beauty-text">Riduci animazioni</span>
              <span className="block text-[13px] text-beauty-muted">Movimenti più sobri nell&apos;interfaccia</span>
            </span>
            <input
              type="checkbox"
              className="size-5 shrink-0 accent-beauty-primary"
              checked={preferences.reduceAnimations}
              onChange={(event) => updatePreference("reduceAnimations", event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-beauty-text">Conferma prima di eliminare</span>
              <span className="block text-[13px] text-beauty-muted">Richiedi conferma per le azioni distruttive</span>
            </span>
            <input
              type="checkbox"
              className="size-5 shrink-0 accent-beauty-primary"
              checked={preferences.confirmBeforeDelete}
              onChange={(event) => updatePreference("confirmBeforeDelete", event.target.checked)}
            />
          </label>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-beauty-muted">Dati</h2>
        <Link href={routes.studioMioStudio} className="block">
          <Card className="flex items-center justify-between gap-3 p-4 transition hover:bg-beauty-card">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-beauty-text">Il mio studio</p>
              <p className="text-[13px] text-beauty-muted">Dati, contatti e informazioni dell&apos;attività.</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-beauty-subtle" aria-hidden="true" />
          </Card>
        </Link>
      </section>
    </div>
  );
}
