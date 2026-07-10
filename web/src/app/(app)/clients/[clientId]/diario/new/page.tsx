import { DiarioNewPageClient } from "@/components/clients/DiarioNewPageClient";

type ClientDiarioNewPageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientDiarioNewPage({ params }: ClientDiarioNewPageProps) {
  const { clientId } = await params;
  return <DiarioNewPageClient clientId={clientId} />;
}
