import { Eye, Hand, PenTool, Scissors, Sparkles, type LucideIcon } from "lucide-react";
import { formatEuroAmount } from "@/lib/utils/currency";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "viso e corpo": Sparkles,
  epilazione: Scissors,
  "unghie e mani/piedi": Hand,
  "trucco e pmu": PenTool,
  "ciglia e sopracciglia": Eye
};

function normalizeCategory(value: string) {
  return value.trim().toLowerCase();
}

export function getServiceCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[normalizeCategory(category)] ?? Sparkles;
}

export function formatServiceDuration(durationMinutes: number | null | undefined) {
  if (typeof durationMinutes === "number" && durationMinutes > 0) {
    return `${durationMinutes} min`;
  }

  return "Durata da impostare";
}

export function formatServicePrice(price: number | null | undefined) {
  if (typeof price === "number" && Number.isFinite(price)) {
    return formatEuroAmount(price);
  }

  return "Prezzo da impostare";
}

export function formatServiceMeta(durationMinutes: number | null | undefined, price: number | null | undefined) {
  return `${formatServiceDuration(durationMinutes)} · ${formatServicePrice(price)}`;
}

export function buildTemplateImportSummary({
  added,
  alreadyPresent,
  ignored,
  errors = 0
}: {
  added: number;
  alreadyPresent: number;
  ignored: number;
  errors?: number;
}) {
  const lines = [
    "Import completato:",
    `${added} servizi aggiunti`,
    `${alreadyPresent} già presenti`,
    `${ignored} ignorati`
  ];

  if (errors > 0) {
    lines.push(`${errors} errori`);
  }

  return lines.join("\n");
}
