import type { ReactNode } from "react";

type TopHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function TopHeader({ title, subtitle, action }: TopHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <h1 className="text-[32px] font-bold leading-tight">{title}</h1>
        {subtitle ? <p className="text-[15px] text-beauty-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
