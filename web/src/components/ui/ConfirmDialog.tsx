"use client";

import { useEffect } from "react";
import { DangerButton } from "@/components/ui/DangerButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Annulla",
  isConfirming = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isConfirming) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isConfirming, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        aria-label="Chiudi finestra di conferma"
        onClick={isConfirming ? undefined : onCancel}
        disabled={isConfirming}
      />
      <div
        className="relative w-full max-w-[320px] overflow-hidden rounded-[20px] border border-beauty-border/70 bg-beauty-elevated/98 shadow-beauty-floating backdrop-blur-xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <div className="space-y-2 px-5 pb-4 pt-5 text-center">
          <h2 id="confirm-dialog-title" className="text-[17px] font-semibold text-beauty-text">
            {title}
          </h2>
          <p id="confirm-dialog-description" className="text-[14px] leading-5 text-beauty-muted">
            {description}
          </p>
        </div>
        <div className="border-t border-beauty-border/70">
          <SecondaryButton
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="h-12 w-full rounded-none border-0 border-b border-beauty-border/70 bg-transparent px-4 text-[17px] font-semibold text-beauty-primary shadow-none hover:translate-y-0"
          >
            {cancelLabel}
          </SecondaryButton>
          <DangerButton
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="h-12 w-full rounded-none bg-transparent px-4 text-[17px] font-semibold text-beauty-danger shadow-none hover:translate-y-0 active:scale-100"
          >
            {isConfirming ? "Eliminazione..." : confirmLabel}
          </DangerButton>
        </div>
      </div>
    </div>
  );
}
