import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type IconBadgeProps = {
  icon: LucideIcon;
  tone?: "primary" | "gold" | "mint" | "lavender" | "neutral";
  className?: string;
};

const tones = {
  primary: "bg-beauty-primary/12 text-beauty-primary",
  gold: "bg-beauty-gold/12 text-beauty-gold",
  mint: "bg-beauty-mint/12 text-beauty-mint",
  lavender: "bg-beauty-lavender/12 text-beauty-lavender",
  neutral: "bg-beauty-card text-beauty-muted"
};

export function IconBadge({ icon: Icon, tone = "primary", className }: IconBadgeProps) {
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-beauty", tones[tone], className)}>
      <Icon aria-hidden="true" className="size-5" strokeWidth={2.1} />
    </span>
  );
}
