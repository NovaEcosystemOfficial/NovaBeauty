"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { Contact, Edit3, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { DangerButton } from "@/components/ui/DangerButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { clientsPath } from "@/lib/firebase/paths";
import type { ClientDocument } from "@/types/firestore";

type ClientItem = ClientDocument & { id: string };
type SortMode = "name" | "createdAt" | "lastVisit" | "totalSpent";

type ClientFormState = {
  name: string;
  surname: string;
  phone: string;
  email: string;
  birthDate: string;
  notes: string;
};

type ContactPickerContact = {
  name?: string[];
  email?: string[];
  tel?: string[];
};

type ContactPreview = {
  id: string;
  selected: boolean;
  name: string;
  surname: string;
  phone: string;
  email: string;
  duplicate: boolean;
};

const emptyClientForm: ClientFormState = {
  name: "",
  surname: "",
  phone: "",
  email: "",
  birthDate: "",
  notes: ""
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    name: parts[0] ?? "",
    surname: parts.slice(1).join(" ")
  };
}

function formatDate(value: ClientDocument["lastVisit"] | ClientDocument["createdAt"]) {
  if (!value?.toDate) {
    return "-";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value.toDate());
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value || 0);
}

export function ClientsManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [form, setForm] = useState<ClientFormState>(emptyClientForm);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [contactImportError, setContactImportError] = useState("");
  const [contactPreview, setContactPreview] = useState<ContactPreview[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clientsCollectionPath = useMemo(() => (user ? clientsPath(user.uid) : null), [user]);
  const isEditing = Boolean(editingClientId);

  useEffect(() => {
    if (!user || !clientsCollectionPath) {
      return;
    }

    setIsLoading(true);
    setError("");

    const clientsQuery = query(collection(db, clientsCollectionPath), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(
      clientsQuery,
      (snapshot) => {
        setClients(
          snapshot.docs.map((clientDoc) => ({
            id: clientDoc.id,
            ...(clientDoc.data() as ClientDocument)
          }))
        );
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Clients subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare i clienti. Controlla la connessione e riprova.");
        showToast("Non siamo riusciti a caricare i clienti.", "error");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [clientsCollectionPath, showToast, user]);

  const filteredClients = useMemo(() => {
    const term = normalize(search);
    const filtered = clients.filter((client) => {
      const haystack = [client.name, client.surname, client.phone, client.email, client.notes ?? ""].join(" ");
      return normalize(haystack).includes(term);
    });

    return filtered.sort((a, b) => {
      if (sortMode === "createdAt") {
        return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
      }

      if (sortMode === "lastVisit") {
        return (b.lastVisit?.toMillis?.() ?? 0) - (a.lastVisit?.toMillis?.() ?? 0);
      }

      if (sortMode === "totalSpent") {
        return (b.totalSpent ?? 0) - (a.totalSpent ?? 0);
      }

      return `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`);
    });
  }, [clients, search, sortMode]);

  function hasDuplicate(phone: string, email: string, excludedClientId?: string) {
    const normalizedPhone = normalize(phone).replace(/\s+/g, "");
    const normalizedEmail = normalize(email);

    return clients.some((client) => {
      if (client.id === excludedClientId) {
        return false;
      }

      const clientPhone = normalize(client.phone).replace(/\s+/g, "");
      const clientEmail = normalize(client.email);
      return Boolean((normalizedPhone && clientPhone === normalizedPhone) || (normalizedEmail && clientEmail === normalizedEmail));
    });
  }

  function updateField(field: keyof ClientFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }

  function openNewClientForm() {
    setEditingClientId(null);
    setForm(emptyClientForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditClientForm(client: ClientItem) {
    setEditingClientId(client.id);
    setForm({
      name: client.name,
      surname: client.surname ?? "",
      phone: client.phone,
      email: client.email ?? "",
      birthDate: client.birthDate ?? "",
      notes: client.notes ?? ""
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingClientId(null);
    setForm(emptyClientForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !clientsCollectionPath) {
      setError("Sessione non valida. Accedi di nuovo per salvare il cliente.");
      return;
    }

    if (!form.name.trim()) {
      setError("Inserisci il nome del cliente.");
      return;
    }

    if (hasDuplicate(form.phone, form.email, editingClientId ?? undefined)) {
      setError("Esiste gia un cliente con lo stesso telefono o la stessa email.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const clientPayload = {
      ownerId: user.uid,
      name: form.name.trim(),
      surname: form.surname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      birthDate: form.birthDate || null,
      notes: form.notes.trim() || null,
      photoUrl: null,
      source: "manual" as const,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingClientId) {
        await updateDoc(doc(db, clientsCollectionPath, editingClientId), clientPayload);
        setSuccess("Cliente aggiornato correttamente.");
        showToast("Cliente aggiornato correttamente.");
      } else {
        const clientRef = doc(collection(db, clientsCollectionPath));
        await setDoc(clientRef, {
          ...clientPayload,
          syncId: clientRef.id,
          lastVisit: null,
          appointmentsCount: 0,
          totalSpent: 0,
          createdAt: serverTimestamp()
        });
        setSuccess("Cliente creato correttamente.");
        showToast("Cliente creato correttamente.");
      }

      closeForm();
    } catch (saveError) {
      console.error("Client save failed", saveError);
      setError("Non siamo riusciti a salvare il cliente. Controlla i dati e riprova.");
      showToast("Non siamo riusciti a salvare il cliente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(client: ClientItem) {
    if (!clientsCollectionPath) {
      return;
    }

    const shouldDelete = window.confirm(`Eliminare ${client.name} ${client.surname ?? ""}? Questa azione non puo essere annullata.`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteDoc(doc(db, clientsCollectionPath, client.id));
      setSuccess("Cliente eliminato.");
      showToast("Cliente eliminato.");
      if (editingClientId === client.id) {
        closeForm();
      }
    } catch (deleteError) {
      console.error("Client delete failed", deleteError);
      setError("Non siamo riusciti a eliminare il cliente. Riprova tra poco.");
      showToast("Non siamo riusciti a eliminare il cliente.", "error");
    }
  }

  async function handleContactImport() {
    setContactImportError("");

    const contactsApi = (navigator as Navigator & {
      contacts?: {
        select: (properties: string[], options: { multiple: boolean }) => Promise<ContactPickerContact[]>;
      };
    }).contacts;

    if (!contactsApi?.select) {
      setContactImportError("Il tuo dispositivo non supporta l'importazione diretta dei contatti.");
      return;
    }

    try {
      const pickedContacts = await contactsApi.select(["name", "email", "tel"], { multiple: true });
      const preview = pickedContacts.map((contact, index) => {
        const fullName = contact.name?.[0] ?? "";
        const splitName = splitFullName(fullName);
        const phone = contact.tel?.[0] ?? "";
        const email = contact.email?.[0] ?? "";

        return {
          id: `${index}-${phone}-${email}`,
          selected: !hasDuplicate(phone, email),
          name: splitName.name || fullName || "Contatto",
          surname: splitName.surname,
          phone,
          email,
          duplicate: hasDuplicate(phone, email)
        };
      });

      setContactPreview(preview);
    } catch (importError) {
      console.error("Contact import failed", importError);
      setContactImportError("Importazione contatti annullata o non disponibile.");
    }
  }

  async function saveSelectedContacts() {
    if (!user || !clientsCollectionPath) {
      return;
    }

    const selectedContacts = contactPreview.filter((contact) => contact.selected && !contact.duplicate);

    if (!selectedContacts.length) {
      setContactImportError("Seleziona almeno un contatto non duplicato.");
      return;
    }

    try {
      await Promise.all(
        selectedContacts.map((contact) => {
          const clientRef = doc(collection(db, clientsCollectionPath));
          return setDoc(clientRef, {
            ownerId: user.uid,
            syncId: clientRef.id,
            name: contact.name,
            surname: contact.surname,
            phone: contact.phone,
            email: contact.email,
            birthDate: null,
            notes: null,
            photoUrl: null,
            lastVisit: null,
            appointmentsCount: 0,
            totalSpent: 0,
            source: "contacts",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        })
      );

      setContactPreview([]);
      setSuccess("Contatti importati correttamente.");
      showToast("Contatti importati correttamente.");
    } catch (importSaveError) {
      console.error("Contact import save failed", importSaveError);
      setContactImportError("Non siamo riusciti a salvare i contatti selezionati.");
      showToast("Importazione non completata.", "error");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-beauty-muted">Anagrafica completa salvata nel namespace NovaBeauty.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SecondaryButton type="button" onClick={handleContactImport}>
            <Upload size={18} aria-hidden="true" />
            Importa da rubrica
          </SecondaryButton>
          <PrimaryButton type="button" onClick={openNewClientForm}>
            <Plus size={18} aria-hidden="true" />
            Nuovo cliente
          </PrimaryButton>
        </div>
      </div>

      <Card className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-beauty-muted" />
          <input
            className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card pl-10 pr-3 text-[15px] text-beauty-text outline-none transition focus:border-beauty-primary focus:bg-beauty-surface"
            placeholder="Cerca per nome, telefono, email o note"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          className="h-11 rounded-beauty border border-beauty-border bg-beauty-card px-3 text-[15px] text-beauty-text outline-none"
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
        >
          <option value="name">Ordina per nome</option>
          <option value="createdAt">Piu recenti</option>
          <option value="lastVisit">Ultima visita</option>
          <option value="totalSpent">Totale speso</option>
        </select>
      </Card>

      {contactImportError ? <ErrorMessage message={contactImportError} /> : null}

      {contactPreview.length ? (
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold">Preview contatti</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">Seleziona i contatti da importare. I duplicati sono esclusi.</p>
            </div>
            <SecondaryButton type="button" onClick={() => setContactPreview([])} className="h-10 px-3">
              <X className="size-4" aria-hidden="true" />
            </SecondaryButton>
          </div>
          <div className="space-y-2">
            {contactPreview.map((contact) => (
              <label key={contact.id} className="flex items-start gap-3 rounded-beauty bg-beauty-card p-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={contact.selected}
                  disabled={contact.duplicate}
                  onChange={(event) =>
                    setContactPreview((current) =>
                      current.map((item) => (item.id === contact.id ? { ...item, selected: event.target.checked } : item))
                    )
                  }
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-beauty-text">{`${contact.name} ${contact.surname}`.trim()}</span>
                  <span className="block text-[13px] text-beauty-muted">{[contact.phone, contact.email].filter(Boolean).join(" - ")}</span>
                  {contact.duplicate ? <span className="text-[12px] text-beauty-danger">Duplicato rilevato</span> : null}
                </span>
              </label>
            ))}
          </div>
          <PrimaryButton type="button" onClick={saveSelectedContacts}>
            Importa selezionati
          </PrimaryButton>
        </Card>
      ) : null}

      {isFormOpen ? (
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold">{isEditing ? "Modifica cliente" : "Nuovo cliente"}</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">Scheda cliente completa per storico e appuntamenti.</p>
            </div>
            <SecondaryButton type="button" onClick={closeForm} className="h-10 px-3" aria-label="Chiudi form">
              <X size={17} aria-hidden="true" />
            </SecondaryButton>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nome" name="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} disabled={isSubmitting} required />
              <FormField label="Cognome" name="surname" value={form.surname} onChange={(event) => updateField("surname", event.target.value)} disabled={isSubmitting} />
              <FormField label="Telefono" name="phone" type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} disabled={isSubmitting} />
              <FormField label="Email" name="email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} disabled={isSubmitting} />
              <FormField label="Data nascita" name="birthDate" type="date" value={form.birthDate} onChange={(event) => updateField("birthDate", event.target.value)} disabled={isSubmitting} />
            </div>
            <TextAreaField label="Note" name="notes" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Preferenze, allergie, promemoria utili." disabled={isSubmitting} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvataggio..." : isEditing ? "Salva modifiche" : "Crea cliente"}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={closeForm} disabled={isSubmitting}>
                Annulla
              </SecondaryButton>
            </div>
          </form>
        </Card>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : filteredClients.length === 0 ? (
        <EmptyState title="Nessun cliente" description={search ? "Nessun cliente corrisponde alla ricerca." : "Aggiungi o importa il primo cliente."} />
      ) : (
        <div className="grid gap-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-beauty-primary/12 text-beauty-primary">
                  <Contact className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-semibold">{`${client.name} ${client.surname ?? ""}`.trim()}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-beauty-muted">
                    {client.phone ? <span>{client.phone}</span> : null}
                    {client.email ? <span>{client.email}</span> : null}
                    {client.birthDate ? <span>Nata/o: {client.birthDate}</span> : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-beauty-subtle">
                    <span>Creata: {formatDate(client.createdAt)}</span>
                    <span>Ultima visita: {formatDate(client.lastVisit)}</span>
                    <span>Appuntamenti: {client.appointmentsCount ?? 0}</span>
                    <span>Totale: {formatCurrency(client.totalSpent ?? 0)}</span>
                  </div>
                  {client.notes ? <p className="mt-2 text-[14px] text-beauty-muted">{client.notes}</p> : null}
                </div>
              </div>
              <div className="flex gap-2">
                <SecondaryButton type="button" onClick={() => openEditClientForm(client)} className="h-10 px-3">
                  <Edit3 size={16} aria-hidden="true" />
                  Modifica
                </SecondaryButton>
                <DangerButton type="button" onClick={() => handleDelete(client)} className="h-10 px-3">
                  <Trash2 size={16} aria-hidden="true" />
                  Elimina
                </DangerButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
