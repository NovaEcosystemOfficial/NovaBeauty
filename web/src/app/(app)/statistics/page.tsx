import { TopHeader } from "@/components/layout/TopHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Statistiche" subtitle="Incasso e appuntamenti del mese" />
      <EmptyState title="Statistiche non disponibili" description="I calcoli useranno solo appuntamenti dell'utente autenticato." />
    </div>
  );
}
