import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp
} from "firebase/firestore";
import { routes } from "@/lib/constants/routes";
import { db } from "@/lib/firebase/client";
import { messagingTokensPath, notificationsPath } from "@/lib/firebase/paths";
import type { NotificationCategory, NotificationPriority } from "@/types/firestore";

type CreateNotificationInput = {
  userId: string;
  title: string;
  description: string;
  type: NotificationCategory;
  priority?: NotificationPriority;
  action?: string | null;
  date?: Timestamp;
};

export async function createNotification({
  userId,
  title,
  description,
  type,
  priority = "normal",
  action = null,
  date
}: CreateNotificationInput) {
  await addDoc(collection(db, notificationsPath(userId)), {
    ownerId: userId,
    title,
    description,
    type,
    priority,
    date: date ?? serverTimestamp(),
    read: false,
    action,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function createWelcomeNotification(userId: string) {
  await createNotification({
    userId,
    title: "Benvenuto su NovaBeauty.",
    description: "Il tuo spazio e' pronto. Completa il profilo per iniziare il test reale.",
    type: "system",
    priority: "normal",
    action: routes.studioMioStudio
  });
}

export async function createLoginNotification(userId: string) {
  await createNotification({
    userId,
    title: "Bentornato.",
    description: "Accesso effettuato correttamente.",
    type: "system",
    priority: "low",
    action: "/dashboard"
  });
}

export async function createProfileCompletedNotification(userId: string) {
  await createNotification({
    userId,
    title: "Profilo completato.",
    description: "Le informazioni del tuo studio sono state salvate correttamente.",
    type: "system",
    priority: "normal",
    action: routes.studioMioStudio
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  await updateDoc(doc(db, notificationsPath(userId), notificationId), {
    read: true,
    updatedAt: serverTimestamp()
  });
}

export async function saveMessagingToken(userId: string, token: string) {
  await setDoc(
    doc(db, messagingTokensPath(userId), token),
    {
      ownerId: userId,
      token,
      userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
}
