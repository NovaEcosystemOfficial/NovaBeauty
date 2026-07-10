"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SplashGate } from "@/components/splash/SplashGate";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <SplashGate>{children}</SplashGate>
      </AuthProvider>
    </ToastProvider>
  );
}
