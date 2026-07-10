import { DiarioEditPageClient } from "@/components/clients/DiarioEditPageClient";

type ClientDiarioEditPageProps = {
  params: Promise<{ clientId: string; entryId: string }>;
};

export default async function ClientDiarioEditPage({ params }: ClientDiarioEditPageProps) {
  const { clientId, entryId } = await params;
  return <DiarioEditPageClient clientId={clientId} entryId={entryId} />;
}
