"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase/client";
import { createUserBootstrapDocuments } from "@/lib/firebase/user-documents";
import { createLoginNotification, createWelcomeNotification } from "@/lib/notifications/notifications";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        createLoginNotification(credential.user.uid).catch((error) => {
          console.error("Login notification failed", error);
        });
      },
      async register(email, password) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserBootstrapDocuments(credential.user);
        createWelcomeNotification(credential.user.uid).catch((error) => {
          console.error("Welcome notification failed", error);
        });
      },
      async resetPassword(email) {
        await sendPasswordResetEmail(auth, email);
      },
      async logout() {
        await signOut(auth);
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve essere usato dentro AuthProvider.");
  }

  return context;
}
