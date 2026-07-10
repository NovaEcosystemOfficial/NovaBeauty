import { ClientSheetView } from "@/components/clients/ClientSheetView";

type ClientSheetPageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientSheetPage({ params }: ClientSheetPageProps) {
  const { clientId } = await params;
  return <ClientSheetView clientId={clientId} />;
}
