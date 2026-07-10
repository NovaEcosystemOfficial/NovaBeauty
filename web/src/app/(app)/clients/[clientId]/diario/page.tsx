import { ClientDiarioPage } from "@/components/clients/ClientDiarioPage";

type ClientDiarioRoutePageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientDiarioRoutePage({ params }: ClientDiarioRoutePageProps) {
  const { clientId } = await params;
  return <ClientDiarioPage clientId={clientId} />;
}
