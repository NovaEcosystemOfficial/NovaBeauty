import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./IconBadge";
import { cn } from "@/lib/utils/cn";

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "primary" | "gold" | "mint" | "lavender";
  trend?: string;
};

export function MetricCard({ label, value, helper, icon, tone = "primary", trend }: MetricCardProps) {
  return (
    <article className="rounded-beauty-lg border border-beauty-border/70 bg-beauty-elevated/85 p-4 shadow-beauty-soft backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <IconBadge icon={icon} tone={tone} />
        {trend ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[12px] font-semibold",
              tone === "mint" ? "bg-beauty-mint/12 text-beauty-mint" : "bg-beauty-primary/12 text-beauty-primary"
            )}
          >
            {trend}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-[13px] font-medium text-beauty-muted">{label}</p>
      <p className="mt-1 text-[26px] font-bold leading-none text-beauty-text">{value}</p>
      <p className="mt-2 text-[12px] text-beauty-subtle">{helper}</p>
    </article>
  );
}
