import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function FormField({ label, id, name, className, ...props }: FormFieldProps) {
  const inputId = id ?? name;

  return (
    <label className="block space-y-2 text-[15px] font-medium" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        name={name}
        className={cn(
          "h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card px-3 text-[15px] text-beauty-text caret-beauty-primary outline-none transition placeholder:text-beauty-subtle focus:border-beauty-primary focus:bg-beauty-surface disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        {...props}
      />
    </label>
  );
}
