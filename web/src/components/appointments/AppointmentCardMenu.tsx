"use client";

import { useEffect, useRef } from "react";
import { Copy, Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DangerButton } from "@/components/ui/DangerButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import type { AppointmentDocument } from "@/types/firestore";

type AppointmentItem = AppointmentDocument & { id: string };

type AppointmentCardMenuProps = {
  appointment: AppointmentItem;
  isOpen: boolean;
  onToggle: (appointmentId: string | null) => void;
  onEdit: (appointment: AppointmentItem) => void;
  onDuplicate: (appointment: AppointmentItem) => void;
  onDelete: (appointment: AppointmentItem) => void;
};

export function AppointmentCardMenu({
  appointment,
  isOpen,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete
}: AppointmentCardMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        onToggle(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onToggle(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onToggle]);

  return (
    <div className="absolute right-3 top-3" ref={menuRef}>
      <SecondaryButton
        type="button"
        onClick={() => onToggle(isOpen ? null : appointment.id)}
        className="size-10 shrink-0 px-0"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Azioni appuntamento ${appointment.clientNameSnapshot}`}
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </SecondaryButton>

      {isOpen ? (
        <Card className="absolute right-0 top-full z-20 mt-1 w-48 space-y-1 p-2 shadow-beauty-floating">
          <SecondaryButton
            type="button"
            onClick={() => {
              onToggle(null);
              onEdit(appointment);
            }}
            className="h-10 w-full justify-start px-3"
          >
            <Edit3 className="size-4" aria-hidden="true" />
            Modifica
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => {
              onToggle(null);
              onDuplicate(appointment);
            }}
            className="h-10 w-full justify-start px-3"
          >
            <Copy className="size-4" aria-hidden="true" />
            Duplica
          </SecondaryButton>
          <DangerButton
            type="button"
            onClick={() => {
              onToggle(null);
              onDelete(appointment);
            }}
            className="h-10 w-full justify-start bg-transparent px-3 text-beauty-danger shadow-none hover:translate-y-0 active:scale-100"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Elimina
          </DangerButton>
        </Card>
      ) : null}
    </div>
  );
}
