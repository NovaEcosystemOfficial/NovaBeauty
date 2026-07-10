"use client";

import {
  collection,
  deleteField,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FullscreenImageViewer } from "@/components/clients/FullscreenImageViewer";
import { DiarioPhotoGallery, type PendingPhoto } from "@/components/clients/DiarioPhotoGallery";
import { useClientDiario } from "@/components/clients/useClientDiario";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { collectDiarioPhotos } from "@/lib/firebase/diary-cleanup";
import { deleteDiarioPhotos, uploadDiarioPhoto, validateDiarioPhoto } from "@/lib/firebase/diary-storage";
import { routes } from "@/lib/constants/routes";
import { appointmentToTimestamp, formatAppointmentOption, formatDiarioDateTime, resolveDiarioPhotos } from "@/lib/utils/diario";
import { cn } from "@/lib/utils/cn";
import { DIARIO_TAGS, type DiarioEntryDocument, type DiarioPhoto, type DiarioPhotoPhase, type DiarioTag } from "@/types/firestore";

type DiarioFormState = {
  title: string;
  text: string;
  tags: DiarioTag[];
  appointmentId: string;
};

const emptyDiarioForm: DiarioFormState = {
  title: "",
  text: "",
  tags: [],
  appointmentId: ""
};

type DiarioEntryFormProps = {
  clientId: string;
  clientName: string;
  entryId?: string;
  initialEntry?: DiarioEntryDocument;
  title: string;
};

export function DiarioEntryForm({ clientId, clientName, entryId, initialEntry, title }: DiarioEntryFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { clientAppointments, operatorName, diarioCollectionPath } = useClientDiario(clientId);
  const [form, setForm] = useState<DiarioFormState>(emptyDiarioForm);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [existingPhotosBefore, setExistingPhotosBefore] = useState(initialEntry ? resolveDiarioPhotos(initialEntry).photosBefore : []);
  const [existingPhotosAfter, setExistingPhotosAfter] = useState(initialEntry ? resolveDiarioPhotos(initialEntry).photosAfter : []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activePhotoPhase, setActivePhotoPhase] = useState<DiarioPhotoPhase>("before");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [viewerPhotos, setViewerPhotos] = useState<DiarioPhoto[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const selectedAppointment = useMemo(
    () => clientAppointments.find((appointment) => appointment.id === form.appointmentId) ?? null,
    [clientAppointments, form.appointmentId]
  );

  useEffect(() => {
    if (!initialEntry) {
      return;
    }

    setForm({
      title: initialEntry.title,
      text: initialEntry.text,
      tags: initialEntry.tags ?? [],
      appointmentId: initialEntry.appointmentId ?? ""
    });
    const { photosBefore, photosAfter } = resolveDiarioPhotos(initialEntry);
    setExistingPhotosBefore(photosBefore);
    setExistingPhotosAfter(photosAfter);
  }, [initialEntry]);

  useEffect(() => {
    return () => {
      pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [pendingPhotos]);

  function applyAppointmentLink(appointmentId: string) {
    const appointment = clientAppointments.find((item) => item.id === appointmentId);
    setForm((current) => ({
      ...current,
      appointmentId,
      title: appointment?.serviceName?.trim() || current.title
    }));
  }

  function toggleTag(tag: DiarioTag) {
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(tag) ? current.tags.filter((item) => item !== tag) : [...current.tags, tag]
    }));
  }

  function openPhotoPicker(phase: DiarioPhotoPhase) {
    setActivePhotoPhase(phase);
    photoInputRef.current?.click();
  }

  function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    const nextPhotos: PendingPhoto[] = [];
    for (const file of files) {
      const validationError = validateDiarioPhoto(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      nextPhotos.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        phase: activePhotoPhase
      });
    }

    setPendingPhotos((current) => [...current, ...nextPhotos]);
    setError("");
  }

  function removePendingPhoto(photoId: string) {
    setPendingPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((photo) => photo.id !== photoId);
    });
  }

  function removeExistingPhoto(phase: DiarioPhotoPhase, photoId: string) {
    if (phase === "before") {
      setExistingPhotosBefore((current) => current.filter((photo) => photo.id !== photoId));
      return;
    }

    setExistingPhotosAfter((current) => current.filter((photo) => photo.id !== photoId));
  }

  function openPhotoViewer(photos: DiarioPhoto[], index: number) {
    setViewerPhotos(photos);
    setViewerIndex(index);
  }

  function resolveOccurredAt() {
    if (selectedAppointment) {
      return appointmentToTimestamp(selectedAppointment.date, selectedAppointment.startTime);
    }

    return serverTimestamp();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !diarioCollectionPath) {
      setError("Sessione non valida. Accedi di nuovo.");
      return;
    }

    if (!form.title.trim()) {
      setError("Inserisci un titolo per la voce di diario.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const entryRef = entryId ? doc(db, diarioCollectionPath, entryId) : doc(collection(db, diarioCollectionPath));
      const resolvedEntryId = entryRef.id;

      const uploadedBefore = await Promise.all(
        pendingPhotos
          .filter((photo) => photo.phase === "before")
          .map((photo) =>
            uploadDiarioPhoto({
              userId: user.uid,
              clientId,
              entryId: resolvedEntryId,
              phase: "before",
              file: photo.file
            })
          )
      );

      const uploadedAfter = await Promise.all(
        pendingPhotos
          .filter((photo) => photo.phase === "after")
          .map((photo) =>
            uploadDiarioPhoto({
              userId: user.uid,
              clientId,
              entryId: resolvedEntryId,
              phase: "after",
              file: photo.file
            })
          )
      );

      const photosBefore = [...existingPhotosBefore, ...uploadedBefore];
      const photosAfter = [...existingPhotosAfter, ...uploadedAfter];
      const appointmentId = form.appointmentId || null;
      const serviceNameSnapshot = selectedAppointment?.serviceName?.trim() || null;
      const operatorNameSnapshot = appointmentId ? operatorName : null;
      const occurredAt = resolveOccurredAt();

      const payload = {
        title: form.title.trim(),
        text: form.text.trim(),
        tags: form.tags,
        appointmentId,
        serviceNameSnapshot,
        operatorNameSnapshot,
        photosBefore,
        photosAfter,
        updatedAt: serverTimestamp()
      };

      if (entryId && initialEntry) {
        const previousResolved = resolveDiarioPhotos(initialEntry);
        const previousPhotos = collectDiarioPhotos(previousResolved.photosBefore, previousResolved.photosAfter);
        const nextPhotos = collectDiarioPhotos(photosBefore, photosAfter);
        const removedPhotos = previousPhotos.filter((photo) => !nextPhotos.some((currentPhoto) => currentPhoto.id === photo.id));

        await deleteDiarioPhotos(removedPhotos);
        await updateDoc(entryRef, {
          ...payload,
          photos: deleteField(),
          ...(appointmentId ? { occurredAt } : {})
        });
        showToast("Voce di diario aggiornata.");
      } else {
        await setDoc(entryRef, {
          ownerId: user.uid,
          syncId: resolvedEntryId,
          clientId,
          occurredAt,
          ...payload,
          createdAt: serverTimestamp()
        });
        showToast("Voce di diario aggiunta.");
      }

      router.push(routes.clientDiario(clientId));
    } catch (saveError) {
      console.error("Diario save failed", saveError);
      setError("Non siamo riusciti a salvare la voce di diario.");
      showToast("Voce di diario non salvata.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 pb-36">
      <SubpageHeader title={title} subtitle={clientName} backHref={routes.clientDiario(clientId)} />

      <form id="diario-entry-form" className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-[15px] font-medium">
          <span>Collega appuntamento</span>
          <select
            className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card px-3 text-[15px] text-beauty-text outline-none transition focus:border-beauty-primary focus:bg-beauty-surface disabled:cursor-not-allowed disabled:opacity-60"
            value={form.appointmentId}
            disabled={isSubmitting}
            onChange={(event) => {
              const nextAppointmentId = event.target.value;
              if (!nextAppointmentId) {
                setForm((current) => ({ ...current, appointmentId: "" }));
                return;
              }

              applyAppointmentLink(nextAppointmentId);
            }}
          >
            <option value="">Nessun appuntamento collegato</option>
            {clientAppointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {formatAppointmentOption(appointment)}
              </option>
            ))}
          </select>
        </label>

        {selectedAppointment ? (
          <div className="grid gap-2 rounded-beauty border border-beauty-border bg-beauty-elevated p-3 text-[13px] text-beauty-muted">
            <p>
              <span className="font-semibold text-beauty-text">Data:</span> {formatDiarioDateTime(appointmentToTimestamp(selectedAppointment.date, selectedAppointment.startTime))}
            </p>
            <p>
              <span className="font-semibold text-beauty-text">Servizio:</span> {selectedAppointment.serviceName}
            </p>
            <p>
              <span className="font-semibold text-beauty-text">Operatore:</span> {operatorName}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-beauty-muted">Data e ora verranno registrate automaticamente al salvataggio.</p>
        )}

        <FormField label="Titolo" name="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required disabled={isSubmitting} />
        <TextAreaField
          label="Testo"
          name="text"
          value={form.text}
          onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
          placeholder="Note sul trattamento, reazioni, prodotti usati..."
          disabled={isSubmitting}
        />

        <div className="space-y-2">
          <p className="text-[15px] font-medium text-beauty-text">Tag</p>
          <div className="flex flex-wrap gap-2">
            {DIARIO_TAGS.map((tag) => {
              const selected = form.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[13px] font-semibold transition",
                    selected
                      ? "border-beauty-primary bg-beauty-primary/12 text-beauty-primary"
                      : "border-beauty-border bg-beauty-card text-beauty-muted"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple className="hidden" onChange={handlePhotoSelection} />

        <DiarioPhotoGallery
          label="Prima"
          photos={existingPhotosBefore}
          pendingPhotos={pendingPhotos}
          phase="before"
          disabled={isSubmitting}
          onAdd={() => openPhotoPicker("before")}
          onRemoveExisting={(photoId) => removeExistingPhoto("before", photoId)}
          onRemovePending={removePendingPhoto}
          onOpenViewer={openPhotoViewer}
        />

        <DiarioPhotoGallery
          label="Dopo"
          photos={existingPhotosAfter}
          pendingPhotos={pendingPhotos}
          phase="after"
          disabled={isSubmitting}
          onAdd={() => openPhotoPicker("after")}
          onRemoveExisting={(photoId) => removeExistingPhoto("after", photoId)}
          onRemovePending={removePendingPhoto}
          onOpenViewer={openPhotoViewer}
        />
      </form>

      {error ? <ErrorMessage message={error} /> : null}

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

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-beauty-border/80 bg-beauty-surface/95 px-beauty-page pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl gap-2">
          <SecondaryButton type="button" onClick={() => router.push(routes.clientDiario(clientId))} disabled={isSubmitting} className="flex-1">
            Annulla
          </SecondaryButton>
          <PrimaryButton type="submit" form="diario-entry-form" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Salvataggio..." : "Salva voce"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
