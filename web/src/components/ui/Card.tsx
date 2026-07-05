import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-beauty-lg border border-beauty-border/70 bg-beauty-elevated/85 p-4 shadow-beauty-soft backdrop-blur", className)}
      {...props}
    />
  );
}
