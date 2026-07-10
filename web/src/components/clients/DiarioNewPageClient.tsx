"use client";

import { DiarioEntryForm } from "@/components/clients/DiarioEntryForm";
import { getClientFullName, useClient } from "@/components/clients/useClient";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton } from "@/components/ui/Skeleton";

type DiarioNewPageClientProps = {
  clientId: string;
};

export function DiarioNewPageClient({ clientId }: DiarioNewPageClientProps) {
  const { client, isLoading, error } = useClient(clientId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!client) {
    return <ErrorMessage message={error || "Cliente non trovato."} />;
  }

  return <DiarioEntryForm clientId={clientId} clientName={getClientFullName(client)} title="Nuova voce di diario" />;
}
