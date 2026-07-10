"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type SubpageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
};

export function SubpageHeader({ title, subtitle, backHref }: SubpageHeaderProps) {
  const router = useRouter();

  return (
    <header className="space-y-3">
      <SecondaryButton
        type="button"
        onClick={() => (backHref ? router.push(backHref) : router.back())}
        className="h-10 px-3"
        aria-label="Indietro"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Indietro
      </SecondaryButton>
      <div className="min-w-0 space-y-1">
        <h1 className="text-[28px] font-bold leading-tight text-beauty-text">{title}</h1>
        {subtitle ? <p className="text-[14px] text-beauty-muted">{subtitle}</p> : null}
      </div>
    </header>
  );
}
