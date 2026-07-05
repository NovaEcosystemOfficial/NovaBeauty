"use client";

import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/client";
import { notificationsPath } from "@/lib/firebase/paths";

export function NotificationBadge() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    const unreadQuery = query(
      collection(db, notificationsPath(user.uid)),
      where("read", "==", false),
      limit(99)
    );

    const unsubscribe = onSnapshot(
      unreadQuery,
      (snapshot) => setCount(snapshot.size),
      (error) => {
        console.error("Unread notifications subscription failed", error);
        setCount(0);
      }
    );

    return unsubscribe;
  }, [user]);

  if (!count) {
    return null;
  }

  return (
    <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-beauty-danger px-1 text-[10px] font-bold leading-4 text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
