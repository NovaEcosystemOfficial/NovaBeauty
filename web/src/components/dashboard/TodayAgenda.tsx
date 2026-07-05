import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppointmentRow } from "./AppointmentRow";

type TodayAgendaProps = {
  appointments?: Array<{
    id: string;
    time: string;
    client: string;
    service: string;
  }>;
};

export function TodayAgenda({ appointments = [] }: TodayAgendaProps) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Agenda di oggi" caption="Solo appuntamenti reali salvati in Firestore" />
      {appointments.length ? (
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <AppointmentRow key={appointment.id} {...appointment} />
          ))}
        </div>
      ) : (
        <EmptyState title="Nessun appuntamento oggi" description="Gli appuntamenti reali compariranno qui." />
      )}
    </section>
  );
}
