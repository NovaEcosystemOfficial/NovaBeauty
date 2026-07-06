"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { refreshMessagingTokenIfGranted, subscribeToForegroundMessages } from "@/lib/firebase/messaging";

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function playForegroundNotificationSound() {
  try {
    const AudioContextConstructor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }

    const audioContext = new AudioContextConstructor();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (soundError) {
    console.debug("Foreground notification sound skipped", {
      message: soundError instanceof Error ? soundError.message : "Audio non disponibile"
    });
  }
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

    refreshMessagingTokenIfGranted(user.uid).catch((error) => {
      console.error("Messaging token refresh failed", {
        message: error instanceof Error ? error.message : "Errore sconosciuto"
      });
    });

    subscribeToForegroundMessages((payload) => {
      const title = payload.notification?.title ?? payload.data?.title ?? "NovaBeauty";
      const description = payload.notification?.body ?? payload.data?.description;
      playForegroundNotificationSound();
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
