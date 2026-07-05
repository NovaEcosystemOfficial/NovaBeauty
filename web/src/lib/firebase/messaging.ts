"use client";

import { getMessaging, getToken, isSupported, onMessage, type MessagePayload } from "firebase/messaging";
import { firebaseApp } from "@/lib/firebase/client";
import { saveMessagingToken } from "@/lib/notifications/notifications";

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

export async function isMessagingAvailable() {
  if (!vapidKey) {
    return false;
  }

  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return false;
  }

  return isSupported();
}

export function hasFirebaseVapidKey() {
  return Boolean(vapidKey);
}

export async function requestNotificationPermissionAndSaveToken(userId: string) {
  const supported = await isMessagingAvailable();

  if (!supported) {
    throw new Error("Le notifiche push non sono disponibili su questo browser o la chiave VAPID non e' configurata.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Permesso notifiche non concesso.");
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const messaging = getMessaging(firebaseApp);
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration
  });

  if (!token) {
    throw new Error("Token notifiche non disponibile.");
  }

  await saveMessagingToken(userId, token);
  return token;
}

export async function subscribeToForegroundMessages(handler: (payload: MessagePayload) => void) {
  const supported = await isMessagingAvailable();

  if (!supported) {
    return () => undefined;
  }

  const messaging = getMessaging(firebaseApp);
  return onMessage(messaging, handler);
}
