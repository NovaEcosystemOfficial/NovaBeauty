import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function TextAreaField({ label, id, name, className, ...props }: TextAreaFieldProps) {
  const inputId = id ?? name;

  return (
    <label className="block space-y-2 text-[15px] font-medium" htmlFor={inputId}>
      <span>{label}</span>
      <textarea
        id={inputId}
        name={name}
        className={cn(
          "min-h-28 w-full resize-y rounded-beauty border border-beauty-border bg-beauty-card px-3 py-3 text-[15px] text-beauty-text caret-beauty-primary outline-none transition placeholder:text-beauty-subtle focus:border-beauty-primary focus:bg-beauty-surface disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        {...props}
      />
    </label>
  );
}
