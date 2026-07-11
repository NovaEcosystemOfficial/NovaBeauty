"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { AppPreferencesRuntime } from "@/components/studio/AppPreferencesRuntime";
import { SplashGate } from "@/components/splash/SplashGate";
import { CapacitorRuntime } from "@/lib/native/capacitor-runtime";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CapacitorRuntime />
        <AppPreferencesRuntime />
        <SplashGate>{children}</SplashGate>
      </AuthProvider>
    </ToastProvider>
  );
}
