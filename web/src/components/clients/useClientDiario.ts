"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/client";
import { appointmentsPath, clientDiarioPath, profilePath } from "@/lib/firebase/paths";
import type { AppointmentDocument, DiarioEntryDocument, ProfileDocument } from "@/types/firestore";

export type DiarioEntryItem = DiarioEntryDocument & { id: string };
export type AppointmentItem = AppointmentDocument & { id: string };

export function useClientDiario(clientId: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiarioEntryItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [operatorName, setOperatorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const diarioCollectionPath = useMemo(() => (user ? clientDiarioPath(user.uid, clientId) : null), [clientId, user]);

  const clientAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.clientId === clientId && appointment.status !== "Annullato")
        .sort((a, b) => (b.date?.toMillis?.() ?? 0) - (a.date?.toMillis?.() ?? 0)),
    [appointments, clientId]
  );

  useEffect(() => {
    if (!user || !diarioCollectionPath) {
      return;
    }

    setIsLoading(true);
    const diarioQuery = query(collection(db, diarioCollectionPath), orderBy("occurredAt", "desc"));
    const unsubscribe = onSnapshot(
      diarioQuery,
      (snapshot) => {
        setEntries(snapshot.docs.map((entryDoc) => ({ id: entryDoc.id, ...(entryDoc.data() as DiarioEntryDocument) })));
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Diario subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare il diario.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [diarioCollectionPath, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, profilePath(user.uid)),
      (snapshot) => {
        const profile = snapshot.data() as ProfileDocument | undefined;
        setOperatorName(profile?.ownerName?.trim() || profile?.displayName?.trim() || user.displayName || "Operatore");
      },
      () => {
        setOperatorName(user.displayName || "Operatore");
      }
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = onSnapshot(query(collection(db, appointmentsPath(user.uid)), orderBy("date", "desc")), (snapshot) => {
      setAppointments(snapshot.docs.map((appointmentDoc) => ({ id: appointmentDoc.id, ...(appointmentDoc.data() as AppointmentDocument) })));
    });

    return unsubscribe;
  }, [user]);

  return {
    entries,
    clientAppointments,
    operatorName,
    isLoading,
    error,
    diarioCollectionPath
  };
}
