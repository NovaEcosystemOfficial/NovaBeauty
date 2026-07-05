import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-beauty-background px-4 py-10">
      <section className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-beauty-lg bg-beauty-card shadow-beauty">
            <span className="text-3xl font-bold text-beauty-primary">N</span>
          </div>
          <p className="text-[24px] font-bold">NovaBeauty</p>
        </div>
        {children}
      </section>
    </main>
  );
}
