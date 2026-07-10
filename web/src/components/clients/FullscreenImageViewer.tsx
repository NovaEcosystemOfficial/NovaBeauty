"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type FullscreenImageViewerProps = {
  images: { id: string; downloadUrl: string }[];
  activeIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

export function FullscreenImageViewer({ images, activeIndex, onClose, onChangeIndex }: FullscreenImageViewerProps) {
  const activeImage = images[activeIndex];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft" && activeIndex > 0) {
        onChangeIndex(activeIndex - 1);
      }

      if (event.key === "ArrowRight" && activeIndex < images.length - 1) {
        onChangeIndex(activeIndex + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length, onChangeIndex, onClose]);

  if (!activeImage) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Anteprima foto">
      <SecondaryButton type="button" onClick={onClose} className="absolute right-4 top-4 z-10 h-10 w-10 px-0" aria-label="Chiudi anteprima">
        <X className="size-5" aria-hidden="true" />
      </SecondaryButton>

      {activeIndex > 0 ? (
        <SecondaryButton
          type="button"
          onClick={() => onChangeIndex(activeIndex - 1)}
          className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 px-0"
          aria-label="Foto precedente"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </SecondaryButton>
      ) : null}

      {activeIndex < images.length - 1 ? (
        <SecondaryButton
          type="button"
          onClick={() => onChangeIndex(activeIndex + 1)}
          className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 px-0"
          aria-label="Foto successiva"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </SecondaryButton>
      ) : null}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activeImage.downloadUrl} alt="" className="max-h-full max-w-full rounded-beauty object-contain" />

      {images.length > 1 ? (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[13px] text-white/80">
          {activeIndex + 1} / {images.length}
        </p>
      ) : null}
    </div>
  );
}
