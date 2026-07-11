"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, PanelsTopLeft, Scissors, UserCircle, Users } from "lucide-react";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { mainNavigation } from "@/lib/constants/navigation";
import { isStudioSectionPath } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const icons = {
  home: Home,
  clients: Users,
  appointments: Calendar,
  services: Scissors,
  studio: PanelsTopLeft,
  profile: UserCircle
};

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-beauty-border/80 bg-beauty-surface/88 shadow-beauty-floating backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-2xl grid-cols-6 pb-[max(env(safe-area-inset-bottom),0px)]">
        {mainNavigation.map((item) => {
          const Icon = icons[item.icon];
          const isActive = item.icon === "studio" ? isStudioSectionPath(pathname) : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[12px] text-beauty-muted transition",
                isActive && "text-beauty-primary"
              )}
            >
              <span className={cn("relative grid size-8 place-items-center rounded-full", isActive && "bg-beauty-primary/12")}>
                <Icon aria-hidden="true" className="size-5" />
                {item.icon === "studio" ? <NotificationBadge /> : null}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
