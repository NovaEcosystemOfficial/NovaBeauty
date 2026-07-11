"use client";

import { StudioHubCard } from "@/components/studio/StudioHubCard";
import { useUnreadNotificationCount } from "@/components/notifications/NotificationBadge";
import { TopHeader } from "@/components/layout/TopHeader";
import { studioHubActiveSections } from "@/lib/constants/studio-hub";

export function StudioHome() {
  const unreadCount = useUnreadNotificationCount();

  return (
    <div className="space-y-5">
      <TopHeader title="Studio" subtitle="Gestisci attività, strumenti e preferenze NovaBeauty." />

      <div className="grid gap-3">
        {studioHubActiveSections.map((section) => (
          <StudioHubCard
            key={section.id}
            title={section.title}
            subtitle={section.description}
            href={section.href}
            icon={section.icon}
            tone={section.tone}
            badgeCount={section.id === "notifiche" ? unreadCount : 0}
          />
        ))}
      </div>
    </div>
  );
}
