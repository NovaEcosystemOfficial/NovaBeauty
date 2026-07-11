"use client";

import { useEffect } from "react";
import { applyStoredAppPreferences } from "@/lib/utils/app-preferences";

export function AppPreferencesRuntime() {
  useEffect(() => {
    applyStoredAppPreferences();
  }, []);

  return null;
}
