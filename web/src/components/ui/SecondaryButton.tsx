import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function SecondaryButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-beauty border border-beauty-border/70 bg-beauty-elevated/80 px-4 text-[15px] font-semibold text-beauty-text shadow-beauty-soft transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        className
      )}
      {...props}
    />
  );
}
