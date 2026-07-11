"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { IconBadge } from "@/components/ui/IconBadge";
import { cn } from "@/lib/utils/cn";

type StudioHubCardProps = {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  tone?: "primary" | "gold" | "mint" | "lavender";
  badgeCount?: number;
};

export function StudioHubCard({ title, subtitle, href, icon, tone = "primary", badgeCount = 0 }: StudioHubCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[88px] items-center gap-3 rounded-beauty-lg border border-beauty-border/70 bg-beauty-elevated/80 p-4 text-left shadow-beauty-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-beauty active:translate-y-0"
    >
      <IconBadge icon={icon} tone={tone} />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-beauty-text">{title}</span>
        <span className="mt-1 block text-[12px] leading-5 text-beauty-muted">{subtitle}</span>
      </span>
      {badgeCount > 0 ? (
        <span className="absolute right-11 top-4 grid min-w-5 place-items-center rounded-full bg-beauty-danger px-1.5 text-[10px] font-bold leading-4 text-white">
          {badgeCount > 9 ? "9+" : badgeCount}
        </span>
      ) : null}
      <ChevronRight className={cn("size-4 shrink-0 text-beauty-subtle transition group-hover:text-beauty-primary")} aria-hidden="true" />
    </Link>
  );
}
