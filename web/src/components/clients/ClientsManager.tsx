"use client";

import { deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, collection } from "firebase/firestore";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { DangerButton } from "@/components/ui/DangerButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FormField } from "@/components/ui/FormField";
import { LoadingState } from "@/components/ui/LoadingState";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { clientsPath } from "@/lib/firebase/paths";
import type { ClientDocument } from "@/types/firestore";

type ClientItem = ClientDocument & {
  id: string;
};

type ClientFormState = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

const emptyClientForm: ClientFormState = {
  name: "",
  phone: "",
  email: "",
  notes: ""
};

export function ClientsManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [form, setForm] = useState<ClientFormState>(emptyClientForm);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      phone: client.phone,
      email: client.email ?? "",
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

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const clientPayload = {
      ownerId: user.uid,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      notes: form.notes.trim() || null,
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

    const shouldDelete = window.confirm(`Eliminare ${client.name}? Questa azione non puo' essere annullata.`);

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[14px] text-beauty-muted">
            Anagrafica essenziale salvata nel namespace NovaBeauty.
          </p>
        </div>
        <PrimaryButton type="button" onClick={openNewClientForm}>
          <Plus size={18} aria-hidden="true" />
          Nuovo cliente
        </PrimaryButton>
      </div>

      {isFormOpen ? (
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold">{isEditing ? "Modifica cliente" : "Nuovo cliente"}</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">
                Nome e contatti bastano per iniziare il test reale.
              </p>
            </div>
            <SecondaryButton type="button" onClick={closeForm} className="h-10 px-3" aria-label="Chiudi form">
              <X size={17} aria-hidden="true" />
            </SecondaryButton>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Nome"
                name="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                disabled={isSubmitting}
                required
              />
              <FormField
                label="Telefono"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                disabled={isSubmitting}
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <TextAreaField
              label="Note"
              name="notes"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Preferenze, allergie, promemoria utili."
              disabled={isSubmitting}
            />

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
        <Card>
          <LoadingState label="Caricamento clienti..." />
        </Card>
      ) : clients.length === 0 ? (
        <EmptyState
          title="Nessun cliente ancora"
          description="Aggiungi il primo cliente per iniziare a usare NovaBeauty durante il test."
        />
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Card key={client.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-[17px] font-semibold">{client.name}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-beauty-muted">
                  {client.phone ? <span>{client.phone}</span> : null}
                  {client.email ? <span>{client.email}</span> : null}
                </div>
                {client.notes ? <p className="mt-2 text-[14px] text-beauty-muted">{client.notes}</p> : null}
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
