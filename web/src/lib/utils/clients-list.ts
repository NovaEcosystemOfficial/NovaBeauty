import type { ClientDocument } from "@/types/firestore";

export type ClientListItem = ClientDocument & { id: string };
export type ClientListSegment = "recenti" | "preferiti" | "tutti";

const RECENT_STORAGE_PREFIX = "novabeauty-recent-clients";
const MAX_RECENT_CLIENTS = 25;

function recentStorageKey(userId: string) {
  return `${RECENT_STORAGE_PREFIX}-${userId}`;
}

export function getClientFullName(client: Pick<ClientListItem, "name" | "surname">) {
  return `${client.name} ${client.surname ?? ""}`.trim();
}

export function getClientSubtitle(client: Pick<ClientListItem, "phone" | "email">) {
  return client.phone || client.email || "";
}

export function getAlphabetLetter(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "#";
  }

  const first = trimmed[0];
  const normalized = first.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  if (/[A-Z]/.test(normalized)) {
    return normalized;
  }

  if (/[0-9]/.test(first)) {
    return "#";
  }

  return "#";
}

export function groupClientsByLetter(clients: ClientListItem[]) {
  const groups = new Map<string, ClientListItem[]>();

  clients.forEach((client) => {
    const letter = getAlphabetLetter(getClientFullName(client));
    const bucket = groups.get(letter) ?? [];
    bucket.push(client);
    groups.set(letter, bucket);
  });

  const letters = Array.from(groups.keys()).sort((a, b) => {
    if (a === "#") {
      return 1;
    }

    if (b === "#") {
      return -1;
    }

    return a.localeCompare(b, "it");
  });

  return letters.map((letter) => ({
    letter,
    clients: (groups.get(letter) ?? []).sort((a, b) => getClientFullName(a).localeCompare(getClientFullName(b), "it"))
  }));
}

export function getRecentClientIds(userId: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(recentStorageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function recordRecentClient(userId: string, clientId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const next = [clientId, ...getRecentClientIds(userId).filter((id) => id !== clientId)].slice(0, MAX_RECENT_CLIENTS);
  window.localStorage.setItem(recentStorageKey(userId), JSON.stringify(next));
}

export function getRecentClients(clients: ClientListItem[], recentIds: string[]) {
  const byId = new Map(clients.map((client) => [client.id, client]));
  const ordered = recentIds.map((id) => byId.get(id)).filter((client): client is ClientListItem => Boolean(client));

  if (ordered.length >= MAX_RECENT_CLIENTS) {
    return ordered.slice(0, MAX_RECENT_CLIENTS);
  }

  const seen = new Set(ordered.map((client) => client.id));
  const newlyCreated = clients
    .filter((client) => !seen.has(client.id))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
    .slice(0, MAX_RECENT_CLIENTS - ordered.length);

  return [...ordered, ...newlyCreated];
}

export function getFavoriteClients(clients: ClientListItem[]) {
  return clients.filter((client) => client.favorite);
}

export function sectionIdForLetter(letter: string) {
  return letter === "#" ? "client-section-hash" : `client-section-${letter.toLowerCase()}`;
}
