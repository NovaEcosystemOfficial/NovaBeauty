import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function PrimaryButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-[15px] bg-beauty-primary px-5 text-[15px] font-semibold text-white shadow-beauty-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-beauty active:translate-y-0 active:scale-[0.98]",
        className
      )}
      {...props}
    />
  );
}
