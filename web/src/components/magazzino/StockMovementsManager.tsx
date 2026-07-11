"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { routes } from "@/lib/constants/routes";
import { db } from "@/lib/firebase/client";
import { stockMovementsPath } from "@/lib/firebase/paths";
import type { StockMovementDocument } from "@/types/firestore";

type MovementItem = StockMovementDocument & { id: string };

export function StockMovementsManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const movementsQuery = query(collection(db, stockMovementsPath(user.uid)), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(
      movementsQuery,
      (snapshot) => {
        setMovements(snapshot.docs.map((movementDoc) => ({ id: movementDoc.id, ...(movementDoc.data() as StockMovementDocument) })));
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Stock movements subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare i movimenti.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  function showComingSoon() {
    showToast("Funzione disponibile nella prossima versione.");
  }

  return (
    <div className="space-y-5">
      <SubpageHeader
        title="Movimenti"
        subtitle="Cronologia carichi e scarichi."
        backHref={routes.studioMagazzino}
      />

      <div className="flex flex-wrap gap-2">
        <PrimaryButton type="button" onClick={showComingSoon} className="h-10 px-3">
          <Plus className="size-4" aria-hidden="true" />
          Nuovo movimento
        </PrimaryButton>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : movements.length === 0 ? (
        <EmptyState
          title="Nessun movimento"
          description="La cronologia dei carichi, scarichi e correzioni apparira' qui quando registrerai il primo movimento."
        />
      ) : null}
    </div>
  );
}
