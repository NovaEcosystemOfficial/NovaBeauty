"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/client";
import { clientsPath } from "@/lib/firebase/paths";
import type { ClientDocument } from "@/types/firestore";

export type ClientItem = ClientDocument & { id: string };

export function useClient(clientId: string) {
  const { user } = useAuth();
  const [client, setClient] = useState<ClientItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !clientId) {
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, clientsPath(user.uid), clientId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setClient(null);
          setError("Cliente non trovato.");
        } else {
          setClient({ id: snapshot.id, ...(snapshot.data() as ClientDocument) });
          setError("");
        }

        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Client subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare il cliente.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [clientId, user]);

  return { client, isLoading, error };
}

export function getClientFullName(client: Pick<ClientDocument, "name" | "surname">) {
  return `${client.name} ${client.surname ?? ""}`.trim();
}
