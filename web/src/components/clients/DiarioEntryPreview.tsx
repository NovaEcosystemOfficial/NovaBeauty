"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { routes } from "@/lib/constants/routes";
import { countDiarioPhotos, formatDiarioDateTime, resolveDiarioPhotos, truncateText } from "@/lib/utils/diario";
import type { DiarioEntryItem } from "@/components/clients/useClientDiario";

type DiarioEntryPreviewProps = {
  clientId: string;
  entry: DiarioEntryItem;
  compact?: boolean;
};

export function DiarioEntryPreview({ clientId, entry, compact = false }: DiarioEntryPreviewProps) {
  const photoCounts = countDiarioPhotos(entry);
  const { photosBefore, photosAfter } = resolveDiarioPhotos(entry);
  const previewPhotos = [...photosBefore.slice(0, 2), ...photosAfter.slice(0, 2)];

  return (
    <Link href={routes.clientDiarioEntry(clientId, entry.id)} className="block">
      <Card className="p-3 transition hover:bg-beauty-card">
        <div className="flex items-start gap-2">
          <BookOpen className="mt-0.5 size-4 shrink-0 text-beauty-muted" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="truncate text-[15px] font-semibold text-beauty-text">{entry.title}</p>
              <p className="mt-1 text-[12px] text-beauty-subtle">{formatDiarioDateTime(entry.occurredAt)}</p>
            </div>

            {entry.serviceNameSnapshot ? <p className="text-[12px] text-beauty-muted">Servizio: {entry.serviceNameSnapshot}</p> : null}

            {!compact && entry.tags?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-beauty-border bg-beauty-elevated px-2 py-0.5 text-[11px] font-semibold text-beauty-muted">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {!compact && entry.text ? <p className="line-clamp-2 text-[13px] text-beauty-muted">{truncateText(entry.text, 140)}</p> : null}

            {photoCounts.total > 0 ? (
              <div className="space-y-2">
                <p className="text-[12px] text-beauty-subtle">
                  Foto: {photoCounts.before} prima · {photoCounts.after} dopo
                </p>
                {!compact && previewPhotos.length > 0 ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {previewPhotos.map((photo) => (
                      <div key={photo.id} className="overflow-hidden rounded-beauty border border-beauty-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.downloadUrl} alt="" className="aspect-square w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
