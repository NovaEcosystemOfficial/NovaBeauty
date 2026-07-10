"use client";

import { ChevronRight, Contact, Edit3, MoreHorizontal, Star, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { DangerButton } from "@/components/ui/DangerButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { getClientFullName, getClientSubtitle, type ClientListItem } from "@/lib/utils/clients-list";
import { cn } from "@/lib/utils/cn";

type ClientListRowProps = {
  client: ClientListItem;
  isMenuOpen: boolean;
  onOpen: (client: ClientListItem) => void;
  onEdit: (client: ClientListItem) => void;
  onDelete: (client: ClientListItem) => void;
  onToggleFavorite: (client: ClientListItem) => void;
  onToggleMenu: (clientId: string | null) => void;
};

export function ClientListRow({
  client,
  isMenuOpen,
  onOpen,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleMenu
}: ClientListRowProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const fullName = getClientFullName(client);
  const subtitle = getClientSubtitle(client);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        onToggleMenu(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onToggleMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen, onToggleMenu]);

  return (
    <div className="relative border-b border-beauty-border/60 last:border-b-0">
      <div className="flex min-w-0 items-stretch">
        <button
          type="button"
          onClick={() => onOpen(client)}
          className="flex min-h-[56px] min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left transition active:bg-beauty-primary/6"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-beauty-primary/12 text-beauty-primary">
            <Contact className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-beauty-text">{fullName}</p>
            {subtitle ? <p className="truncate text-[13px] text-beauty-muted">{subtitle}</p> : null}
          </div>
          <ChevronRight className="size-4 shrink-0 text-beauty-subtle" aria-hidden="true" />
        </button>

        <div className="relative flex shrink-0 items-center pr-1" ref={menuRef}>
          <SecondaryButton
            type="button"
            onClick={() => onToggleMenu(isMenuOpen ? null : client.id)}
            className="size-10 shrink-0 px-0"
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            aria-label={`Azioni per ${fullName}`}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </SecondaryButton>

          {isMenuOpen ? (
            <Card className="absolute right-0 top-full z-30 mt-1 w-52 space-y-1 p-2 shadow-beauty-floating">
              <SecondaryButton
                type="button"
                onClick={() => {
                  onToggleMenu(null);
                  onEdit(client);
                }}
                className="h-10 w-full justify-start px-3"
              >
                <Edit3 className="size-4" aria-hidden="true" />
                Modifica
              </SecondaryButton>
              <SecondaryButton
                type="button"
                onClick={() => {
                  onToggleFavorite(client);
                  onToggleMenu(null);
                }}
                className="h-10 w-full justify-start px-3"
              >
                <Star className={cn("size-4", client.favorite && "fill-beauty-primary text-beauty-primary")} aria-hidden="true" />
                {client.favorite ? "Rimuovi preferito" : "Aggiungi preferito"}
              </SecondaryButton>
              <DangerButton
                type="button"
                onClick={() => {
                  onToggleMenu(null);
                  onDelete(client);
                }}
                className="h-10 w-full justify-start px-3"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Elimina
              </DangerButton>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
