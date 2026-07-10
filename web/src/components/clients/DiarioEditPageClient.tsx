"use client";

import { DiarioEntryForm } from "@/components/clients/DiarioEntryForm";
import { getClientFullName, useClient } from "@/components/clients/useClient";
import { useClientDiario } from "@/components/clients/useClientDiario";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton } from "@/components/ui/Skeleton";

type DiarioEditPageClientProps = {
  clientId: string;
  entryId: string;
};

export function DiarioEditPageClient({ clientId, entryId }: DiarioEditPageClientProps) {
  const { client, isLoading: isClientLoading } = useClient(clientId);
  const { entries, isLoading } = useClientDiario(clientId);
  const entry = entries.find((item) => item.id === entryId);

  if (isClientLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!client || !entry) {
    return <ErrorMessage message="Voce di diario non trovata." />;
  }

  return (
    <DiarioEntryForm
      clientId={clientId}
      clientName={getClientFullName(client)}
      entryId={entryId}
      initialEntry={entry}
      title="Modifica voce"
    />
  );
}
