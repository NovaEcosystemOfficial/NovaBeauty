import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function DangerButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-[15px] bg-beauty-danger px-5 text-[15px] font-semibold text-white transition active:scale-[0.98]",
        className
      )}
      {...props}
    />
  );
}
