"use client";

import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpen, Edit3, Trash2 } from "lucide-react";
import { FullscreenImageViewer } from "@/components/clients/FullscreenImageViewer";
import { getClientFullName, useClient } from "@/components/clients/useClient";
import { useClientDiario } from "@/components/clients/useClientDiario";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Card } from "@/components/ui/Card";
import { DangerButton } from "@/components/ui/DangerButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { collectDiarioPhotos } from "@/lib/firebase/diary-cleanup";
import { deleteDiarioPhotos } from "@/lib/firebase/diary-storage";
import { routes } from "@/lib/constants/routes";
import { formatDiarioDateTime, resolveDiarioPhotos } from "@/lib/utils/diario";
import type { DiarioPhoto } from "@/types/firestore";

type ClientDiarioEntryViewProps = {
  clientId: string;
  entryId: string;
};

export function ClientDiarioEntryView({ clientId, entryId }: ClientDiarioEntryViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { client, isLoading: isClientLoading } = useClient(clientId);
  const { entries, isLoading, diarioCollectionPath } = useClientDiario(clientId);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [viewerPhotos, setViewerPhotos] = useState<DiarioPhoto[]>([]);

  const entry = useMemo(() => entries.find((item) => item.id === entryId) ?? null, [entries, entryId]);

  if (isClientLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!client || !entry) {
    return <ErrorMessage message="Voce di diario non trovata." />;
  }

  const fullName = getClientFullName(client);
  const { photosBefore, photosAfter } = resolveDiarioPhotos(entry);

  async function handleDelete() {
    if (!diarioCollectionPath || !entry) {
      return;
    }

    if (!window.confirm(`Eliminare la voce "${entry.title}" dal diario di ${fullName}?`)) {
      return;
    }

    try {
      await deleteDiarioPhotos(collectDiarioPhotos(photosBefore, photosAfter));
      await deleteDoc(doc(db, diarioCollectionPath, entry.id));
      showToast("Voce di diario eliminata.");
      router.push(routes.clientDiario(clientId));
    } catch (deleteError) {
      console.error("Diario delete failed", deleteError);
      showToast("Voce di diario non eliminata.", "error");
    }
  }

  function openPhotoViewer(photos: DiarioPhoto[], index: number) {
    setViewerPhotos(photos);
    setViewerIndex(index);
  }

  return (
    <div className="space-y-5">
      <SubpageHeader title={entry.title} subtitle={fullName} backHref={routes.clientDiario(clientId)} />

      <Card className="space-y-4">
        <div className="flex items-start gap-2">
          <BookOpen className="mt-0.5 size-4 shrink-0 text-beauty-muted" aria-hidden="true" />
          <div>
            <p className="text-[12px] text-beauty-subtle">{formatDiarioDateTime(entry.occurredAt)}</p>
          </div>
        </div>

        {entry.appointmentId ? (
          <div className="rounded-beauty border border-beauty-border bg-beauty-elevated px-3 py-2 text-[13px] text-beauty-muted">
            {entry.serviceNameSnapshot ? <p>Servizio: {entry.serviceNameSnapshot}</p> : null}
            {entry.operatorNameSnapshot ? <p>Operatore: {entry.operatorNameSnapshot}</p> : null}
          </div>
        ) : null}

        {entry.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-beauty-border bg-beauty-elevated px-2.5 py-1 text-[12px] font-semibold text-beauty-muted">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {entry.text ? <p className="text-[15px] leading-7 text-beauty-muted">{entry.text}</p> : null}

        {photosBefore.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-beauty-text">Prima</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photosBefore.map((photo, index) => (
                <button key={photo.id} type="button" onClick={() => openPhotoViewer(photosBefore, index)} className="overflow-hidden rounded-beauty border border-beauty-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.downloadUrl} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {photosAfter.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-beauty-text">Dopo</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photosAfter.map((photo, index) => (
                <button key={photo.id} type="button" onClick={() => openPhotoViewer(photosAfter, index)} className="overflow-hidden rounded-beauty border border-beauty-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.downloadUrl} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <SecondaryButton type="button" onClick={() => router.push(routes.clientDiarioEdit(clientId, entryId))} className="h-10 px-3">
            <Edit3 className="size-4" aria-hidden="true" />
            Modifica
          </SecondaryButton>
          <DangerButton type="button" onClick={handleDelete} className="h-10 px-3">
            <Trash2 className="size-4" aria-hidden="true" />
            Elimina
          </DangerButton>
        </div>
      </Card>

      {viewerIndex !== null ? (
        <FullscreenImageViewer
          images={viewerPhotos}
          activeIndex={viewerIndex}
          onClose={() => {
            setViewerIndex(null);
            setViewerPhotos([]);
          }}
          onChangeIndex={setViewerIndex}
        />
      ) : null}
    </div>
  );
}
