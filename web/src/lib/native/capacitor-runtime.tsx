"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export function isCapacitorNative() {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

export function CapacitorRuntime() {
  useEffect(() => {
    if (!isCapacitorNative()) {
      return;
    }

    let backButtonListener: { remove: () => Promise<void> } | null = null;

    async function initializeNativeShell() {
      try {
        await StatusBar.setBackgroundColor({ color: "#D8A7B1" });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (statusBarError) {
        console.warn("StatusBar setup skipped", statusBarError);
      }

      try {
        await SplashScreen.hide();
      } catch (splashError) {
        console.warn("SplashScreen hide skipped", splashError);
      }

      backButtonListener = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
          return;
        }

        void App.exitApp();
      });
    }

    void initializeNativeShell();

    return () => {
      if (backButtonListener) {
        void backButtonListener.remove();
      }
    };
  }, []);

  return null;
}
