import type { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./client";

export async function createUserBootstrapDocuments(user: User) {
  const timestamp = serverTimestamp();
  const email = user.email ?? "";
  const displayName = user.displayName ?? "";

  await Promise.all([
    setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email,
        displayName,
        createdAt: timestamp,
        updatedAt: timestamp,
        onboardingCompleted: false
      },
      { merge: true }
    ),
    setDoc(
      doc(db, "users", user.uid, "profile", "main"),
      {
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
      },
      { merge: true }
    ),
    setDoc(
      doc(db, "users", user.uid, "settings", "main"),
      {
        ownerId: user.uid,
        email,
        displayName,
        theme: "estetica",
        locale: "it-IT",
        currency: "EUR",
        createdAt: timestamp,
        updatedAt: timestamp,
        onboardingCompleted: false
      },
      { merge: true }
    )
  ]);
}
