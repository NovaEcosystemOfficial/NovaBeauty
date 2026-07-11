export const APP_PREFERENCES_STORAGE_KEY = "novabeauty-app-preferences";

export type AppPreferences = {
  reduceAnimations: boolean;
  confirmBeforeDelete: boolean;
};

const defaultPreferences: AppPreferences = {
  reduceAnimations: false,
  confirmBeforeDelete: true
};

export function getAppPreferences(): AppPreferences {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  try {
    const raw = window.localStorage.getItem(APP_PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return defaultPreferences;
    }

    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    return {
      reduceAnimations: Boolean(parsed.reduceAnimations),
      confirmBeforeDelete: parsed.confirmBeforeDelete ?? true
    };
  } catch {
    return defaultPreferences;
  }
}

export function saveAppPreferences(preferences: AppPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  document.documentElement.toggleAttribute("data-reduce-motion", preferences.reduceAnimations);
}

export function applyStoredAppPreferences() {
  if (typeof window === "undefined") {
    return;
  }

  const preferences = getAppPreferences();
  document.documentElement.toggleAttribute("data-reduce-motion", preferences.reduceAnimations);
}
