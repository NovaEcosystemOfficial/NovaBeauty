"use client";

import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Calendar, Contact, Edit3, NotebookText, Plus, Trash2 } from "lucide-react";
import { DiarioEntryPreview } from "@/components/clients/DiarioEntryPreview";
import { getClientFullName, useClient } from "@/components/clients/useClient";
import { useClientDiario } from "@/components/clients/useClientDiario";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Card } from "@/components/ui/Card";
import { DangerButton } from "@/components/ui/DangerButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { deleteClientDiarioData } from "@/lib/firebase/diary-cleanup";
import { clientsPath } from "@/lib/firebase/paths";
import { routes } from "@/lib/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import type { ClientDocument } from "@/types/firestore";
import type { Timestamp } from "firebase/firestore";

type ClientSheetViewProps = {
  clientId: string;
};

function formatDate(value: ClientDocument["lastVisit"] | ClientDocument["createdAt"]) {
  if (!value || typeof value === "string") {
    return "—";
  }

  const timestamp = value as Timestamp;
  if (!timestamp.toDate) {
    return "—";
  }

  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(timestamp.toDate());
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value || 0);
}

export function ClientSheetView({ clientId }: ClientSheetViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { client, isLoading, error } = useClient(clientId);
  const { entries, isLoading: isDiarioLoading } = useClientDiario(clientId);
  const recentEntries = entries.slice(0, 3);

  async function handleDelete() {
    if (!user || !client) {
      return;
    }

    const fullName = getClientFullName(client);
    if (!window.confirm(`Eliminare ${fullName}? Questa azione non puo essere annullata.`)) {
      return;
    }

    try {
      await deleteClientDiarioData(user.uid, client.id);
      await deleteDoc(doc(db, clientsPath(user.uid), client.id));
      showToast("Cliente eliminato.");
      router.push(routes.clients);
    } catch (deleteError) {
      console.error("Client delete failed", deleteError);
      showToast("Non siamo riusciti a eliminare il cliente.", "error");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-40" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  if (!client) {
    return <ErrorMessage message={error || "Cliente non trovato."} />;
  }

  const fullName = getClientFullName(client);

  return (
    <div className="space-y-5">
      <SubpageHeader title="Scheda cliente" subtitle={fullName} backHref={routes.clients} />

      <Card className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-beauty-primary/12 text-beauty-primary">
            <Contact className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[20px] font-semibold text-beauty-text">{fullName}</p>
            {client.phone ? <p className="mt-1 text-[14px] text-beauty-muted">{client.phone}</p> : null}
            {client.email ? <p className="text-[14px] text-beauty-muted">{client.email}</p> : null}
          </div>
        </div>

        <div className="grid gap-2 text-[13px] text-beauty-subtle sm:grid-cols-2">
          <p>Creata: {formatDate(client.createdAt)}</p>
          <p>Ultima visita: {formatDate(client.lastVisit)}</p>
          <p>Appuntamenti: {client.appointmentsCount ?? 0}</p>
          <p>Totale speso: {formatCurrency(client.totalSpent ?? 0)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SecondaryButton type="button" onClick={() => router.push(`${routes.clients}?edit=${client.id}`)} className="h-10 px-3">
            <Edit3 className="size-4" aria-hidden="true" />
            Modifica
          </SecondaryButton>
          <DangerButton type="button" onClick={handleDelete} className="h-10 px-3">
            <Trash2 className="size-4" aria-hidden="true" />
            Elimina
          </DangerButton>
        </div>
      </Card>

      <div className="grid gap-2 sm:grid-cols-3">
        <SecondaryButton type="button" onClick={() => router.push(routes.clientDiario(clientId))} className="h-11 w-full px-3">
          <NotebookText className="size-4" aria-hidden="true" />
          Apri diario
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => router.push(routes.appointmentsForClient(clientId))} className="h-11 w-full px-3">
          <Calendar className="size-4" aria-hidden="true" />
          Appuntamenti
        </SecondaryButton>
        <PrimaryButton type="button" onClick={() => router.push(routes.clientDiarioNew(clientId))} className="h-11 w-full px-3">
          <Plus className="size-4" aria-hidden="true" />
          Nuova voce
        </PrimaryButton>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-bold text-beauty-text">Ultime note</h2>
          {entries.length > 0 ? (
            <button type="button" onClick={() => router.push(routes.clientDiario(clientId))} className="text-[13px] font-semibold text-beauty-primary">
              Vedi tutte
            </button>
          ) : null}
        </div>

        {isDiarioLoading ? (
          <Skeleton className="h-20" />
        ) : recentEntries.length === 0 ? (
          <Card className="py-6 text-center">
            <p className="text-[14px] font-semibold text-beauty-text">Nessuna nota ancora</p>
            <p className="mt-1 text-[13px] text-beauty-muted">Aggiungi la prima voce di diario per questo cliente.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <DiarioEntryPreview key={entry.id} clientId={clientId} entry={entry} compact />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
