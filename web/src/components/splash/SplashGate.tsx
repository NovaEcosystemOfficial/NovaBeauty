"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { NovaBeautySplash } from "@/components/splash/NovaBeautySplash";
import { useAuth } from "@/contexts/AuthContext";

const SPLASH_SESSION_KEY = "novabeauty-splash-complete";
const SPLASH_MIN_MS = 2000;
const SPLASH_FADE_OUT_MS = 450;

type SplashGateProps = {
  children: ReactNode;
};

export function SplashGate({ children }: SplashGateProps) {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_SESSION_KEY)) {
      return;
    }

    startedAtRef.current = Date.now();
    setShowSplash(true);
  }, []);

  useEffect(() => {
    if (!showSplash || fadingOut || loading) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const startedAt = startedAtRef.current;
      if (!startedAt) {
        return;
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed >= SPLASH_MIN_MS) {
        window.clearInterval(intervalId);
        setFadingOut(true);
        dismissTimerRef.current = window.setTimeout(() => {
          setShowSplash(false);
          sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
        }, SPLASH_FADE_OUT_MS);
      }
    }, 40);

    return () => {
      window.clearInterval(intervalId);
      if (dismissTimerRef.current) {
        window.clearTimeout(dismissTimerRef.current);
      }
    };
  }, [fadingOut, loading, showSplash]);

  return (
    <>
      {children}
      {showSplash ? <NovaBeautySplash fadingOut={fadingOut} /> : null}
    </>
  );
}
