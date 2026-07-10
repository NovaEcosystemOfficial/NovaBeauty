"use client";

import {
  Timestamp,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { BookOpen, Camera, Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FullscreenImageViewer } from "@/components/clients/FullscreenImageViewer";
import { DangerButton } from "@/components/ui/DangerButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { collectDiarioPhotos } from "@/lib/firebase/diary-cleanup";
import { deleteDiarioPhotos, uploadDiarioPhoto, validateDiarioPhoto } from "@/lib/firebase/diary-storage";
import { db } from "@/lib/firebase/client";
import { appointmentsPath, clientDiarioPath, profilePath } from "@/lib/firebase/paths";
import { appointmentToTimestamp, formatAppointmentOption, resolveDiarioPhotos } from "@/lib/utils/diario";
import { cn } from "@/lib/utils/cn";
import {
  DIARIO_TAGS,
  type AppointmentDocument,
  type DiarioEntryDocument,
  type DiarioPhoto,
  type DiarioPhotoPhase,
  type DiarioTag,
  type ProfileDocument
} from "@/types/firestore";

type DiarioEntryItem = DiarioEntryDocument & { id: string };
type AppointmentItem = AppointmentDocument & { id: string };

type DiarioFormState = {
  title: string;
  text: string;
  tags: DiarioTag[];
  appointmentId: string;
};

type PendingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  phase: DiarioPhotoPhase;
};

const emptyDiarioForm: DiarioFormState = {
  title: "",
  text: "",
  tags: [],
  appointmentId: ""
};

type ClientDiarioSectionProps = {
  clientId: string;
  clientName: string;
};

function formatDateTime(timestamp: Timestamp | null | undefined) {
  if (!timestamp?.toDate) {
    return "—";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(timestamp.toDate());
}

type PhotoGalleryProps = {
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

function PhotoGallery({
  label,
  photos,
  pendingPhotos,
  phase,
  disabled,
  onAdd,
  onRemoveExisting,
  onRemovePending,
  onOpenViewer
}: PhotoGalleryProps) {
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
          <Camera className="size-4" aria-hidden="true" />
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

export function ClientDiarioSection({ clientId, clientName }: ClientDiarioSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<DiarioEntryItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [operatorName, setOperatorName] = useState("");
  const [form, setForm] = useState<DiarioFormState>(emptyDiarioForm);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [existingPhotosBefore, setExistingPhotosBefore] = useState<DiarioPhoto[]>([]);
  const [existingPhotosAfter, setExistingPhotosAfter] = useState<DiarioPhoto[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [viewerPhotos, setViewerPhotos] = useState<DiarioPhoto[]>([]);
  const [activePhotoPhase, setActivePhotoPhase] = useState<DiarioPhotoPhase>("before");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const diarioCollectionPath = useMemo(() => (user ? clientDiarioPath(user.uid, clientId) : null), [clientId, user]);

  const clientAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.clientId === clientId && appointment.status !== "Annullato")
        .sort((a, b) => (b.date?.toMillis?.() ?? 0) - (a.date?.toMillis?.() ?? 0)),
    [appointments, clientId]
  );

  const selectedAppointment = useMemo(
    () => clientAppointments.find((appointment) => appointment.id === form.appointmentId) ?? null,
    [clientAppointments, form.appointmentId]
  );

  useEffect(() => {
    if (!user || !diarioCollectionPath) {
      return;
    }

    setIsLoading(true);
    const diarioQuery = query(collection(db, diarioCollectionPath), orderBy("occurredAt", "desc"));
    const unsubscribe = onSnapshot(
      diarioQuery,
      (snapshot) => {
        setEntries(snapshot.docs.map((entryDoc) => ({ id: entryDoc.id, ...(entryDoc.data() as DiarioEntryDocument) })));
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Diario subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare il diario.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [diarioCollectionPath, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, profilePath(user.uid)),
      (snapshot) => {
        const profile = snapshot.data() as ProfileDocument | undefined;
        setOperatorName(profile?.ownerName?.trim() || profile?.displayName?.trim() || user.displayName || "Operatore");
      },
      () => {
        setOperatorName(user.displayName || "Operatore");
      }
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = onSnapshot(query(collection(db, appointmentsPath(user.uid)), orderBy("date", "desc")), (snapshot) => {
      setAppointments(snapshot.docs.map((appointmentDoc) => ({ id: appointmentDoc.id, ...(appointmentDoc.data() as AppointmentDocument) })));
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    return () => {
      pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [pendingPhotos]);

  function resetForm() {
    pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setForm(emptyDiarioForm);
    setPendingPhotos([]);
    setExistingPhotosBefore([]);
    setExistingPhotosAfter([]);
    setEditingEntryId(null);
    setIsFormOpen(false);
    setError("");
  }

  function openNewEntryForm() {
    resetForm();
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditEntryForm(entry: DiarioEntryItem) {
    pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    const { photosBefore, photosAfter } = resolveDiarioPhotos(entry);
    setEditingEntryId(entry.id);
    setForm({
      title: entry.title,
      text: entry.text,
      tags: entry.tags ?? [],
      appointmentId: entry.appointmentId ?? ""
    });
    setExistingPhotosBefore(photosBefore);
    setExistingPhotosAfter(photosAfter);
    setPendingPhotos([]);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

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
    setSuccess("");

    try {
      const entryRef = editingEntryId ? doc(db, diarioCollectionPath, editingEntryId) : doc(collection(db, diarioCollectionPath));
      const entryId = entryRef.id;

      const uploadedBefore = await Promise.all(
        pendingPhotos
          .filter((photo) => photo.phase === "before")
          .map((photo) =>
            uploadDiarioPhoto({
              userId: user.uid,
              clientId,
              entryId,
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
              entryId,
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

      if (editingEntryId) {
        const previousEntry = entries.find((entry) => entry.id === editingEntryId);
        const previousResolved = previousEntry ? resolveDiarioPhotos(previousEntry) : { photosBefore: [], photosAfter: [] };
        const previousPhotos = collectDiarioPhotos(previousResolved.photosBefore, previousResolved.photosAfter);
        const nextPhotos = collectDiarioPhotos(photosBefore, photosAfter);
        const removedPhotos = previousPhotos.filter((photo) => !nextPhotos.some((currentPhoto) => currentPhoto.id === photo.id));

        await deleteDiarioPhotos(removedPhotos);
        await updateDoc(entryRef, {
          ...payload,
          photos: deleteField(),
          ...(appointmentId ? { occurredAt } : {})
        });

        setSuccess("Voce di diario aggiornata.");
        showToast("Voce di diario aggiornata.");
      } else {
        await setDoc(entryRef, {
          ownerId: user.uid,
          syncId: entryId,
          clientId,
          occurredAt,
          ...payload,
          createdAt: serverTimestamp()
        });

        setSuccess("Voce di diario aggiunta.");
        showToast("Voce di diario aggiunta.");
      }

      resetForm();
    } catch (saveError) {
      console.error("Diario save failed", saveError);
      setError("Non siamo riusciti a salvare la voce di diario.");
      showToast("Voce di diario non salvata.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entry: DiarioEntryItem) {
    if (!diarioCollectionPath) {
      return;
    }

    if (!window.confirm(`Eliminare la voce "${entry.title}" dal diario di ${clientName}?`)) {
      return;
    }

    try {
      const { photosBefore, photosAfter } = resolveDiarioPhotos(entry);
      await deleteDiarioPhotos(collectDiarioPhotos(photosBefore, photosAfter));
      await deleteDoc(doc(db, diarioCollectionPath, entry.id));
      setSuccess("Voce di diario eliminata.");
      showToast("Voce di diario eliminata.");
    } catch (deleteError) {
      console.error("Diario delete failed", deleteError);
      setError("Non siamo riusciti a eliminare la voce di diario.");
      showToast("Voce di diario non eliminata.", "error");
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Diario"
        caption="Eventi cronologici, note e foto prima/dopo legate a questo cliente."
        action={
          !isFormOpen ? (
            <PrimaryButton type="button" onClick={openNewEntryForm} className="h-10 px-3">
              <Plus className="size-4" aria-hidden="true" />
              Nuova voce
            </PrimaryButton>
          ) : null
        }
      />

      {isFormOpen ? (
        <div className="space-y-4 rounded-beauty border border-beauty-border bg-beauty-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-semibold text-beauty-text">{editingEntryId ? "Modifica voce" : "Nuova voce di diario"}</h3>
              <p className="mt-1 text-[13px] text-beauty-muted">
                {selectedAppointment
                  ? "Data, servizio e operatore vengono importati dall'appuntamento collegato."
                  : "Data e ora verranno registrate automaticamente al salvataggio."}
              </p>
            </div>
            <SecondaryButton type="button" onClick={resetForm} className="h-10 px-3" aria-label="Chiudi form diario">
              <X className="size-4" aria-hidden="true" />
            </SecondaryButton>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-[15px] font-medium">
              <span>Collega appuntamento</span>
              <select
                className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card px-3 text-[15px] text-beauty-text outline-none transition focus:border-beauty-primary focus:bg-beauty-surface disabled:cursor-not-allowed disabled:opacity-60"
                value={form.appointmentId}
                disabled={isSubmitting}
                onChange={(event) => {
                  const appointmentId = event.target.value;
                  if (!appointmentId) {
                    setForm((current) => ({ ...current, appointmentId: "" }));
                    return;
                  }

                  applyAppointmentLink(appointmentId);
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
                  <span className="font-semibold text-beauty-text">Data:</span> {formatDateTime(appointmentToTimestamp(selectedAppointment.date, selectedAppointment.startTime))}
                </p>
                <p>
                  <span className="font-semibold text-beauty-text">Servizio:</span> {selectedAppointment.serviceName}
                </p>
                <p>
                  <span className="font-semibold text-beauty-text">Operatore:</span> {operatorName}
                </p>
              </div>
            ) : null}

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

            <div className="space-y-4">
              <PhotoGallery
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
              <PhotoGallery
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
            </div>

            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvataggio..." : editingEntryId ? "Salva voce" : "Aggiungi voce"}
            </PrimaryButton>
          </form>
        </div>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState title="Diario vuoto" description="Aggiungi la prima voce per documentare trattamenti e progressi del cliente." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const { photosBefore, photosAfter } = resolveDiarioPhotos(entry);

            return (
              <div key={entry.id} className="rounded-beauty border border-beauty-border bg-beauty-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 size-4 shrink-0 text-beauty-muted" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-[16px] font-semibold text-beauty-text">{entry.title}</p>
                        <p className="mt-1 text-[12px] text-beauty-subtle">{formatDateTime(entry.occurredAt)}</p>
                      </div>
                    </div>

                    {entry.appointmentId ? (
                      <div className="rounded-beauty border border-beauty-border bg-beauty-elevated px-3 py-2 text-[12px] text-beauty-muted">
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

                    {entry.text ? <p className="text-[14px] leading-6 text-beauty-muted">{entry.text}</p> : null}

                    {photosBefore.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[13px] font-semibold text-beauty-text">Prima</p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {photosBefore.map((photo, index) => (
                            <button
                              key={photo.id}
                              type="button"
                              onClick={() => openPhotoViewer(photosBefore, index)}
                              className="overflow-hidden rounded-beauty border border-beauty-border"
                            >
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
                            <button
                              key={photo.id}
                              type="button"
                              onClick={() => openPhotoViewer(photosAfter, index)}
                              className="overflow-hidden rounded-beauty border border-beauty-border"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo.downloadUrl} alt="" className="aspect-square w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <SecondaryButton type="button" onClick={() => openEditEntryForm(entry)} className="h-10 px-3">
                      <Edit3 className="size-4" aria-hidden="true" />
                      Modifica
                    </SecondaryButton>
                    <DangerButton type="button" onClick={() => handleDelete(entry)} className="h-10 px-3">
                      <Trash2 className="size-4" aria-hidden="true" />
                      Elimina
                    </DangerButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
