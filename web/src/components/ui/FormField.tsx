import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function FormField({ label, id, name, ...props }: FormFieldProps) {
  const inputId = id ?? name;

  return (
    <label className="block space-y-2 text-[15px] font-medium" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        name={name}
        className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card px-3 text-[15px] outline-none transition focus:border-beauty-primary focus:bg-white"
        {...props}
      />
    </label>
  );
}
