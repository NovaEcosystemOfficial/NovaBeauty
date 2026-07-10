"use client";

import { X } from "lucide-react";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import type { DiarioPhoto, DiarioPhotoPhase } from "@/types/firestore";

type PendingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  phase: DiarioPhotoPhase;
};

type DiarioPhotoGalleryProps = {
  label: string;
  photos: DiarioPhoto[];
  pendingPhotos: PendingPhoto[];
  phase: DiarioPhotoPhase;
  disabled: boolean;
  onAdd: () => void;
  onRemoveExisting: (photoId: string) => void;
  onRemovePending: (photoId: string) => void;
  onOpenViewer: (photos: DiarioPhoto[], index: number) => void;
};

export function DiarioPhotoGallery({
  label,
  photos,
  pendingPhotos,
  phase,
  disabled,
  onAdd,
  onRemoveExisting,
  onRemovePending,
  onOpenViewer
}: DiarioPhotoGalleryProps) {
  const phasePending = pendingPhotos.filter((photo) => photo.phase === phase);
  const viewerPhotos = [
    ...photos,
    ...phasePending.map((photo) => ({ id: photo.id, storagePath: "", downloadUrl: photo.previewUrl, phase }))
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-beauty-text">{label}</p>
        <SecondaryButton type="button" onClick={onAdd} disabled={disabled} className="h-9 px-3 text-[13px]">
          Aggiungi
        </SecondaryButton>
      </div>

      {viewerPhotos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative overflow-hidden rounded-beauty border border-beauty-border">
              <button type="button" className="block w-full" onClick={() => onOpenViewer(viewerPhotos, index)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.downloadUrl} alt="" className="aspect-square w-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveExisting(photo.id)}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/55 text-white"
                aria-label={`Rimuovi foto ${label.toLowerCase()}`}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          {phasePending.map((photo, index) => (
            <div key={photo.id} className="relative overflow-hidden rounded-beauty border border-beauty-border">
              <button type="button" className="block w-full" onClick={() => onOpenViewer(viewerPhotos, photos.length + index)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.previewUrl} alt="" className="aspect-square w-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => onRemovePending(photo.id)}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/55 text-white"
                aria-label={`Rimuovi foto ${label.toLowerCase()}`}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-beauty-muted">Nessuna foto {label.toLowerCase()}.</p>
      )}
    </div>
  );
}

export type { PendingPhoto };
