import { Timestamp } from "firebase/firestore";
import type { AppointmentDocument, DiarioEntryDocument } from "@/types/firestore";

export function appointmentToTimestamp(date: Timestamp, startTime: string) {
  const nextDate = date.toDate();
  const [hours, minutes] = startTime.split(":").map(Number);
  nextDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return Timestamp.fromDate(nextDate);
}

export function resolveDiarioPhotos(entry: DiarioEntryDocument) {
  return {
    photosBefore: entry.photosBefore?.length ? entry.photosBefore : entry.photos ?? [],
    photosAfter: entry.photosAfter ?? []
  };
}

export function formatAppointmentOption(appointment: AppointmentDocument & { id: string }) {
  const date = appointment.date?.toDate?.();
  const dateLabel = date
    ? new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(date)
    : "—";

  return `${dateLabel} · ${appointment.startTime} · ${appointment.serviceName}`;
}
