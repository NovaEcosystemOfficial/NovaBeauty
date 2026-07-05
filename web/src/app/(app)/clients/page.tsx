import { TopHeader } from "@/components/layout/TopHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Clienti" subtitle="Lista clienti dell'utente autenticato" />
      <EmptyState title="Nessun cliente" description="La gestione clienti verra' sviluppata nella milestone dedicata." />
    </div>
  );
}
