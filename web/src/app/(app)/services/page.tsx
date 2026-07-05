import { TopHeader } from "@/components/layout/TopHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Servizi" subtitle="Listino estetica" />
      <EmptyState title="Nessun servizio" description="Catalogo e validazioni verranno aggiunti nella milestone servizi." />
    </div>
  );
}
