"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { subscribeToForegroundMessages } from "@/lib/firebase/messaging";
import { createNotification } from "@/lib/notifications/notifications";
import type { NotificationCategory, NotificationPriority } from "@/types/firestore";

function parseCategory(value: string | undefined): NotificationCategory {
  const allowed: NotificationCategory[] = ["appointment", "client", "finance", "system", "promotion"];
  return allowed.includes(value as NotificationCategory) ? (value as NotificationCategory) : "system";
}

function parsePriority(value: string | undefined): NotificationPriority {
  const allowed: NotificationPriority[] = ["low", "normal", "high"];
  return allowed.includes(value as NotificationPriority) ? (value as NotificationPriority) : "normal";
}

export function NotificationRuntime() {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      return;
    }

    let unsubscribe: () => void = () => undefined;
    let active = true;

    subscribeToForegroundMessages((payload) => {
      const title = payload.notification?.title ?? payload.data?.title ?? "NovaBeauty";
      const description = payload.notification?.body ?? payload.data?.description ?? "";
      const action = payload.data?.action ?? "/notifications";

      showToast(title, "success");

      createNotification({
        userId: user.uid,
        title,
        description,
        type: parseCategory(payload.data?.type),
        priority: parsePriority(payload.data?.priority),
        action
      }).catch((error) => {
        console.error("Foreground notification persistence failed", error);
      });
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
