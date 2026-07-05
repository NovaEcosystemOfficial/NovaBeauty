import { AppointmentsManager } from "@/components/appointments/AppointmentsManager";
import { TopHeader } from "@/components/layout/TopHeader";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Appuntamenti" subtitle="Agenda ordinata per data" />
      <AppointmentsManager />
    </div>
  );
}
