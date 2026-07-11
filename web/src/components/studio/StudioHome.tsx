"use client";

import { Bell, Boxes, Settings2, Store } from "lucide-react";
import { StudioHubCard } from "@/components/studio/StudioHubCard";
import { useUnreadNotificationCount } from "@/components/notifications/NotificationBadge";
import { TopHeader } from "@/components/layout/TopHeader";
import { routes } from "@/lib/constants/routes";

export function StudioHome() {
  const unreadCount = useUnreadNotificationCount();

  return (
    <div className="space-y-5">
      <TopHeader title="Studio" subtitle="Gestisci attività, strumenti e preferenze NovaBeauty." />

      <div className="grid gap-3">
        <StudioHubCard
          title="Notifiche"
          subtitle="Push, promemoria e cronologia"
          href={routes.notifications}
          icon={Bell}
          tone="primary"
          badgeCount={unreadCount}
        />
        <StudioHubCard
          title="Magazzino"
          subtitle="Prodotti, scorte e consumi"
          href={routes.studioMagazzino}
          icon={Boxes}
          tone="mint"
        />
        <StudioHubCard
          title="Profilo attività"
          subtitle="Dati, contatti e identità dello studio"
          href={routes.profile}
          icon={Store}
          tone="gold"
        />
        <StudioHubCard
          title="Impostazioni app"
          subtitle="Preferenze e comportamento dell'app"
          href={routes.studioSettings}
          icon={Settings2}
          tone="lavender"
        />
      </div>
    </div>
  );
}
