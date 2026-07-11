import type { LucideIcon } from "lucide-react";
import { Bell, Boxes, Settings2, Store } from "lucide-react";
import { routes } from "@/lib/constants/routes";

export type StudioHubSectionTone = "primary" | "gold" | "mint" | "lavender";

export type StudioHubSection = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: StudioHubSectionTone;
};

export const studioHubActiveSections: StudioHubSection[] = [
  {
    id: "mio-studio",
    title: "Il mio studio",
    description: "Dati, contatti e informazioni dell'attività.",
    href: routes.studioMioStudio,
    icon: Store,
    tone: "gold"
  },
  {
    id: "notifiche",
    title: "Notifiche",
    description: "Push, promemoria e cronologia.",
    href: routes.notifications,
    icon: Bell,
    tone: "primary"
  },
  {
    id: "magazzino",
    title: "Magazzino",
    description: "Prodotti, consumi e scorte.",
    href: routes.studioMagazzino,
    icon: Boxes,
    tone: "mint"
  },
  {
    id: "impostazioni",
    title: "Impostazioni",
    description: "Preferenze dell'app e configurazione.",
    href: routes.studioSettings,
    icon: Settings2,
    tone: "lavender"
  }
];

export type StudioHubFutureSection = {
  id: string;
  title: string;
  description: string;
  enabled: false;
};

export const studioHubFutureSections: StudioHubFutureSection[] = [
  {
    id: "operatori",
    title: "Operatori",
    description: "Gestione del team e dei ruoli.",
    enabled: false
  },
  {
    id: "statistiche",
    title: "Statistiche",
    description: "Andamento dell'attività e report.",
    enabled: false
  },
  {
    id: "backup",
    title: "Backup e sincronizzazione",
    description: "Copie di sicurezza e sincronizzazione dati.",
    enabled: false
  },
  {
    id: "abbonamento",
    title: "Abbonamento",
    description: "Piano, fatturazione e rinnovi.",
    enabled: false
  },
  {
    id: "esportazioni",
    title: "Esportazioni",
    description: "Esportazione dati e report.",
    enabled: false
  },
  {
    id: "integrazioni",
    title: "Integrazioni",
    description: "Collegamenti con servizi esterni.",
    enabled: false
  }
];
