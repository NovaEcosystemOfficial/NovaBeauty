import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, ClipboardList, Package, Truck } from "lucide-react";
import { routes } from "@/lib/constants/routes";

export type MagazzinoHubSectionTone = "primary" | "gold" | "mint" | "lavender";

export type MagazzinoHubSection = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: MagazzinoHubSectionTone;
};

export const magazzinoHubSections: MagazzinoHubSection[] = [
  {
    id: "prodotti",
    title: "Prodotti",
    description: "Tutti i prodotti utilizzati nel centro.",
    href: routes.studioMagazzinoProdotti,
    icon: Package,
    tone: "primary"
  },
  {
    id: "fornitori",
    title: "Fornitori",
    description: "Rivenditori, cataloghi e contatti.",
    href: routes.studioMagazzinoFornitori,
    icon: Truck,
    tone: "gold"
  },
  {
    id: "da-ordinare",
    title: "Da ordinare",
    description: "Prodotti sotto la soglia minima.",
    href: routes.studioMagazzinoDaOrdinare,
    icon: ClipboardList,
    tone: "mint"
  },
  {
    id: "movimenti",
    title: "Movimenti",
    description: "Cronologia carichi e scarichi.",
    href: routes.studioMagazzinoMovimenti,
    icon: ArrowLeftRight,
    tone: "lavender"
  }
];
