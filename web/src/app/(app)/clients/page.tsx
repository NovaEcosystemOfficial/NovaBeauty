import { ClientsManager } from "@/components/clients/ClientsManager";
import { TopHeader } from "@/components/layout/TopHeader";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Clienti" subtitle="Lista clienti dell'utente autenticato" />
      <ClientsManager />
    </div>
  );
}
