import type { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./client";

type BootstrapWrite = {
  path: string;
  data: Record<string, unknown>;
};

export class BootstrapWriteError extends Error {
  code: string;
  path: string;

  constructor(path: string, error: unknown) {
    const firebaseLikeError = error as { code?: string; message?: string };
    const code = firebaseLikeError.code ?? "unknown";
    const message = firebaseLikeError.message ?? "Errore sconosciuto";

    super(`Firestore bootstrap failed at ${path}: ${code} - ${message}`);
    this.name = "BootstrapWriteError";
    this.code = code;
    this.path = path;
    this.cause = error;
  }
}

export async function createUserBootstrapDocuments(user: User) {
  const timestamp = serverTimestamp();
  const email = user.email ?? "";
  const displayName = user.displayName ?? "";

  const writes: BootstrapWrite[] = [
    {
      path: `users/${user.uid}`,
      data: {
        email,
        displayName,
        apps: {
          novabeauty: true
        },
        createdAt: timestamp,
        updatedAt: timestamp
      }
    },
    {
      path: `novabeautyUsers/${user.uid}`,
      data: {
        ownerId: user.uid,
        email,
        displayName,
        createdAt: timestamp,
        updatedAt: timestamp,
        onboardingCompleted: false
      }
    },
    {
      path: `novabeautyUsers/${user.uid}/profile/main`,
      data: {
        ownerId: user.uid,
        syncId: user.uid,
        email,
        displayName,
        businessName: displayName || "NovaBeauty",
        phone: "",
        address: "",
        openingHours: "",
        description: "",
        businessType: "estetica",
        imageUrl: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        onboardingCompleted: false
      }
    },
    {
      path: `novabeautyUsers/${user.uid}/settings/main`,
      data: {
        ownerId: user.uid,
        email,
        displayName,
        theme: "estetica",
        locale: "it-IT",
        currency: "EUR",
        createdAt: timestamp,
        updatedAt: timestamp,
        onboardingCompleted: false
      }
    }
  ];

  for (const write of writes) {
    try {
      await setDoc(doc(db, write.path), write.data, { merge: true });
    } catch (error) {
      throw new BootstrapWriteError(write.path, error);
    }
  }
}
