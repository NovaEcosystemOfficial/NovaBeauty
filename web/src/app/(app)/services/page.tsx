import { TopHeader } from "@/components/layout/TopHeader";
import { ServicesManager } from "@/components/services/ServicesManager";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Servizi" subtitle="Catalogo trattamenti" />
      <ServicesManager />
    </div>
  );
}
