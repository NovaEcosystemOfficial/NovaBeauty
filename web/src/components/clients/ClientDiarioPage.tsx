"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DiarioEntryPreview } from "@/components/clients/DiarioEntryPreview";
import { getClientFullName, useClient } from "@/components/clients/useClient";
import { useClientDiario } from "@/components/clients/useClientDiario";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { routes } from "@/lib/constants/routes";

type ClientDiarioPageProps = {
  clientId: string;
};

export function ClientDiarioPage({ clientId }: ClientDiarioPageProps) {
  const router = useRouter();
  const { client, isLoading: isClientLoading } = useClient(clientId);
  const { entries, isLoading, error } = useClientDiario(clientId);

  if (isClientLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!client) {
    return <ErrorMessage message="Cliente non trovato." />;
  }

  const fullName = getClientFullName(client);

  return (
    <div className="space-y-5">
      <SubpageHeader title="Diario" subtitle={fullName} backHref={routes.clientSheet(clientId)} />

      <div className="flex justify-end">
        <PrimaryButton type="button" onClick={() => router.push(routes.clientDiarioNew(clientId))} className="h-10 px-3">
          <Plus className="size-4" aria-hidden="true" />
          Nuova voce
        </PrimaryButton>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState title="Diario vuoto" description="Aggiungi la prima voce per documentare trattamenti e progressi del cliente." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <DiarioEntryPreview key={entry.id} clientId={clientId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
