"use client";

import { useMemo, useState } from "react";
import { ClientListRow } from "@/components/clients/ClientListRow";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getFavoriteClients,
  getRecentClientIds,
  getRecentClients,
  groupClientsByLetter,
  sectionIdForLetter,
  type ClientListItem,
  type ClientListSegment
} from "@/lib/utils/clients-list";

type SortMode = "name" | "createdAt" | "lastVisit" | "totalSpent";

type ClientsCompactListProps = {
  filteredClients: ClientListItem[];
  isLoading: boolean;
  search: string;
  sortMode: SortMode;
  segment: ClientListSegment;
  userId: string | undefined;
  recentRefreshKey?: number;
  onOpenClient: (client: ClientListItem) => void;
  onEditClient: (client: ClientListItem) => void;
  onDeleteClient: (client: ClientListItem) => void;
  onToggleFavorite: (client: ClientListItem) => void;
};

export function ClientsCompactList({
  filteredClients,
  isLoading,
  search,
  sortMode,
  segment,
  userId,
  recentRefreshKey = 0,
  onOpenClient,
  onEditClient,
  onDeleteClient,
  onToggleFavorite
}: ClientsCompactListProps) {
  const [openMenuClientId, setOpenMenuClientId] = useState<string | null>(null);

  const recentIds = useMemo(() => {
    void recentRefreshKey;
    return userId ? getRecentClientIds(userId) : [];
  }, [userId, recentRefreshKey]);

  const segmentClients = useMemo(() => {
    if (segment === "recenti") {
      return getRecentClients(filteredClients, recentIds);
    }

    if (segment === "preferiti") {
      return getFavoriteClients(filteredClients);
    }

    return filteredClients;
  }, [filteredClients, recentIds, segment]);

  const useAlphabetGroups = segment === "tutti" && sortMode === "name" && !search.trim();
  const groupedClients = useMemo(
    () => (useAlphabetGroups ? groupClientsByLetter(segmentClients) : []),
    [segmentClients, useAlphabetGroups]
  );

  const flatClients = useMemo(() => {
    if (useAlphabetGroups) {
      return [];
    }

    return segmentClients;
  }, [segmentClients, useAlphabetGroups]);

  function scrollToLetter(letter: string) {
    const sectionId = sectionIdForLetter(letter);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderRows(items: ClientListItem[]) {
    return items.map((client) => (
      <ClientListRow
        key={client.id}
        client={client}
        isMenuOpen={openMenuClientId === client.id}
        onOpen={onOpenClient}
        onEdit={onEditClient}
        onDelete={onDeleteClient}
        onToggleFavorite={onToggleFavorite}
        onToggleMenu={setOpenMenuClientId}
      />
    ));
  }

  const emptyDescription = search
    ? "Nessun cliente corrisponde alla ricerca."
    : segment === "preferiti"
      ? "Aggiungi clienti ai preferiti dal menu azioni sulla riga."
      : segment === "recenti"
        ? "I clienti aperti o creati di recente compariranno qui."
        : "Aggiungi o importa il primo cliente.";

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    );
  }

  if (segmentClients.length === 0) {
    return <EmptyState title="Nessun cliente" description={emptyDescription} />;
  }

  if (useAlphabetGroups) {
    return (
      <div className="relative pb-2">
        <Card className="overflow-hidden p-0">
          {groupedClients.map((group) => (
            <section key={group.letter} id={sectionIdForLetter(group.letter)}>
              <div className="sticky top-[10.25rem] z-10 border-b border-beauty-border/60 bg-beauty-surface/95 px-3 py-1.5 text-[12px] font-bold tracking-wide text-beauty-primary backdrop-blur-xl md:top-[8.75rem]">
                {group.letter}
              </div>
              {renderRows(group.clients)}
            </section>
          ))}
        </Card>

        {groupedClients.length > 3 ? (
          <nav
            aria-label="Indice alfabetico"
            className="pointer-events-none fixed inset-y-28 right-1 z-20 flex w-5 flex-col items-center justify-center gap-0.5"
          >
            {groupedClients.map((group) => (
              <button
                key={group.letter}
                type="button"
                onClick={() => scrollToLetter(group.letter)}
                className="pointer-events-auto px-0.5 py-0.5 text-[10px] font-bold leading-none text-beauty-primary/80 transition hover:text-beauty-primary"
              >
                {group.letter}
              </button>
            ))}
          </nav>
        ) : null}
      </div>
    );
  }

  return <Card className="overflow-hidden p-0">{renderRows(flatClients)}</Card>;
}
