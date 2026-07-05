"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { refreshMessagingTokenIfGranted, subscribeToForegroundMessages } from "@/lib/firebase/messaging";

export function NotificationRuntime() {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      return;
    }

    let unsubscribe: () => void = () => undefined;
    let active = true;

    refreshMessagingTokenIfGranted(user.uid).catch((error) => {
      console.error("Messaging token refresh failed", {
        message: error instanceof Error ? error.message : "Errore sconosciuto"
      });
    });

    subscribeToForegroundMessages((payload) => {
      const title = payload.notification?.title ?? payload.data?.title ?? "NovaBeauty";
      const description = payload.notification?.body ?? payload.data?.description;
      showToast(description ? `${title}: ${description}` : title, "success");
    })
      .then((cleanup) => {
        if (active) {
          unsubscribe = cleanup;
        } else {
          cleanup();
        }
      })
      .catch((error) => {
        console.error("Foreground messaging setup failed", error);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [showToast, user]);

  return null;
}
