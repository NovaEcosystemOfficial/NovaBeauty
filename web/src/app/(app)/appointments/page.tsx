import { TopHeader } from "@/components/layout/TopHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Appuntamenti" subtitle="Agenda ordinata per data" />
      <EmptyState title="Nessun appuntamento" description="Form, lista e reminder saranno collegati a Firestore piu' avanti." />
    </div>
  );
}
