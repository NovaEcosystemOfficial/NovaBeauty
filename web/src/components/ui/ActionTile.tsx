import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./IconBadge";

type ActionTileProps = {
  title: string;
  caption: string;
  icon: LucideIcon;
  tone?: "primary" | "gold" | "mint" | "lavender";
};

export function ActionTile({ title, caption, icon, tone = "primary" }: ActionTileProps) {
  return (
    <button
      type="button"
      className="group flex min-h-24 w-full items-start gap-3 rounded-beauty-lg border border-beauty-border/70 bg-beauty-elevated/80 p-4 text-left shadow-beauty-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-beauty active:translate-y-0"
    >
      <IconBadge icon={icon} tone={tone} />
      <span className="min-w-0">
        <span className="block text-[15px] font-bold text-beauty-text">{title}</span>
        <span className="mt-1 block text-[12px] leading-5 text-beauty-muted">{caption}</span>
      </span>
    </button>
  );
}
