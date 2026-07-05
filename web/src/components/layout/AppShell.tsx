import type { ReactNode } from "react";
import { NotificationRuntime } from "@/components/notifications/NotificationRuntime";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { BottomNavigation } from "./BottomNavigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-transparent text-beauty-text">
      <main className="mx-auto min-h-dvh w-full max-w-6xl px-beauty-page pb-28 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <NotificationRuntime />
      <InstallPrompt />
      <BottomNavigation />
    </div>
  );
}
