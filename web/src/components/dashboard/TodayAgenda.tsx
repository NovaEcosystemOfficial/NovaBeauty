import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppointmentRow } from "./AppointmentRow";

const appointments = [
  { time: "09:30", client: "Giulia R.", service: "Pulizia viso premium", price: "EUR 65" },
  { time: "11:00", client: "Marta L.", service: "Trattamento corpo", price: "EUR 90" },
  { time: "15:30", client: "Elena P.", service: "Massaggio drenante", price: "EUR 75" }
];

export function TodayAgenda() {
  return (
    <section className="space-y-3">
      <SectionHeader title="Agenda di oggi" caption="Trattamenti programmati e incasso previsto" />
      <div className="space-y-2">
        {appointments.map((appointment) => (
          <AppointmentRow key={appointment.time} {...appointment} />
        ))}
      </div>
    </section>
  );
}
