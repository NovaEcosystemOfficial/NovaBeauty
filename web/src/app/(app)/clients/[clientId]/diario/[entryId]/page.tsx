import { ClientDiarioEntryView } from "@/components/clients/ClientDiarioEntryView";

type ClientDiarioEntryPageProps = {
  params: Promise<{ clientId: string; entryId: string }>;
};

export default async function ClientDiarioEntryPage({ params }: ClientDiarioEntryPageProps) {
  const { clientId, entryId } = await params;
  return <ClientDiarioEntryView clientId={clientId} entryId={entryId} />;
}
