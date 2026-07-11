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
import { Edit3, ExternalLink, Globe, Mail, MessageCircle, Phone, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Card } from "@/components/ui/Card";
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
import { routes } from "@/lib/constants/routes";
import { db } from "@/lib/firebase/client";
import { suppliersPath } from "@/lib/firebase/paths";
import {
  buildEmailUrl,
  buildExternalUrl,
  buildPhoneUrl,
  buildWhatsAppUrl
} from "@/lib/utils/supplier-links";
import type { SupplierDocument } from "@/types/firestore";

type SupplierItem = SupplierDocument & { id: string };

type SupplierFormState = {
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  catalogUrl: string;
  address: string;
  notes: string;
};

const emptyForm: SupplierFormState = {
  name: "",
  phone: "",
  email: "",
  whatsapp: "",
  website: "",
  catalogUrl: "",
  address: "",
  notes: ""
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function SuppliersManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [form, setForm] = useState<SupplierFormState>(emptyForm);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const collectionPath = useMemo(() => (user ? suppliersPath(user.uid) : null), [user]);

  useEffect(() => {
    if (!collectionPath) {
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, collectionPath), orderBy("name", "asc")),
      (snapshot) => {
        setSuppliers(snapshot.docs.map((supplierDoc) => ({ id: supplierDoc.id, ...(supplierDoc.data() as SupplierDocument) })));
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Suppliers subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare i fornitori.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath]);

  function updateField(field: keyof SupplierFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }

  function openNewSupplierForm() {
    setEditingSupplierId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditSupplierForm(supplier: SupplierItem) {
    setEditingSupplierId(supplier.id);
    setForm({
      name: supplier.name,
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      whatsapp: supplier.whatsapp ?? "",
      website: supplier.website ?? "",
      catalogUrl: supplier.catalogUrl ?? "",
      address: supplier.address ?? "",
      notes: supplier.notes ?? ""
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingSupplierId(null);
    setForm(emptyForm);
  }

  function hasDuplicate(name: string, excludedSupplierId?: string) {
    const normalizedName = normalize(name);
    return suppliers.some((supplier) => supplier.id !== excludedSupplierId && normalize(supplier.name) === normalizedName);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !collectionPath) {
      setError("Sessione non valida. Accedi di nuovo.");
      return;
    }

    if (!form.name.trim()) {
      setError("Il nome del fornitore e' obbligatorio.");
      return;
    }

    if (hasDuplicate(form.name, editingSupplierId ?? undefined)) {
      setError("Esiste gia un fornitore con questo nome.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      ownerId: user.uid,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      website: form.website.trim() || null,
      catalogUrl: form.catalogUrl.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      active: true,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingSupplierId) {
        await updateDoc(doc(db, collectionPath, editingSupplierId), payload);
        setSuccess("Fornitore aggiornato.");
        showToast("Fornitore aggiornato.");
      } else {
        const supplierRef = doc(collection(db, collectionPath));
        await setDoc(supplierRef, {
          ...payload,
          syncId: supplierRef.id,
          createdAt: serverTimestamp()
        });
        setSuccess("Fornitore creato.");
        showToast("Fornitore creato.");
      }

      closeForm();
    } catch (saveError) {
      console.error("Supplier save failed", saveError);
      setError("Non siamo riusciti a salvare il fornitore.");
      showToast("Fornitore non salvato.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(supplier: SupplierItem) {
    if (!collectionPath) {
      return;
    }

    if (!window.confirm(`Eliminare ${supplier.name}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, collectionPath, supplier.id));
      setSuccess("Fornitore eliminato.");
      showToast("Fornitore eliminato.");
    } catch (deleteError) {
      console.error("Supplier delete failed", deleteError);
      setError("Non siamo riusciti a eliminare il fornitore.");
      showToast("Fornitore non eliminato.", "error");
    }
  }

  return (
    <div className="space-y-5">
      <SubpageHeader
        title="Fornitori"
        subtitle="Rivenditori, cataloghi e contatti."
        backHref={routes.studioMagazzino}
      />

      <div className="flex flex-wrap gap-2">
        <PrimaryButton type="button" onClick={openNewSupplierForm} className="h-10 px-3">
          <Plus className="size-4" aria-hidden="true" />
          Nuovo fornitore
        </PrimaryButton>
      </div>

      {isFormOpen ? (
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-bold text-beauty-text">{editingSupplierId ? "Modifica fornitore" : "Nuovo fornitore"}</h2>
            <button type="button" onClick={closeForm} className="grid size-8 place-items-center rounded-full text-beauty-muted transition hover:bg-beauty-card">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="Nome" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Telefono" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
              <FormField label="Email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            </div>
            <FormField label="WhatsApp" value={form.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Sito Web" value={form.website} onChange={(event) => updateField("website", event.target.value)} />
              <FormField label="Link catalogo" value={form.catalogUrl} onChange={(event) => updateField("catalogUrl", event.target.value)} />
            </div>
            <FormField label="Indirizzo" value={form.address} onChange={(event) => updateField("address", event.target.value)} />
            <TextAreaField label="Note" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} />
            {error ? <ErrorMessage message={error} /> : null}
            {success ? <SuccessMessage message={success} /> : null}
            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {editingSupplierId ? "Salva modifiche" : "Crea fornitore"}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={closeForm}>
                Annulla
              </SecondaryButton>
            </div>
          </form>
        </Card>
      ) : null}

      {error && !isFormOpen ? <ErrorMessage message={error} /> : null}
      {success && !isFormOpen ? <SuccessMessage message={success} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : suppliers.length === 0 ? (
        <EmptyState title="Nessun fornitore" description="Aggiungi il primo fornitore per collegarlo ai prodotti del magazzino." />
      ) : (
        <div className="space-y-3">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={() => openEditSupplierForm(supplier)}
              onDelete={() => handleDelete(supplier)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type SupplierCardProps = {
  supplier: SupplierItem;
  onEdit: () => void;
  onDelete: () => void;
};

function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
  const websiteUrl = supplier.website ? buildExternalUrl(supplier.website) : null;
  const catalogUrl = supplier.catalogUrl ? buildExternalUrl(supplier.catalogUrl) : null;
  const phoneUrl = supplier.phone ? buildPhoneUrl(supplier.phone) : null;
  const whatsappUrl = supplier.whatsapp ? buildWhatsAppUrl(supplier.whatsapp) : null;
  const emailUrl = supplier.email ? buildEmailUrl(supplier.email) : null;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[16px] font-bold text-beauty-text">{supplier.name}</p>
          {supplier.address ? <p className="mt-1 text-[13px] text-beauty-muted">{supplier.address}</p> : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="grid size-9 place-items-center rounded-full text-beauty-muted transition hover:bg-beauty-card hover:text-beauty-primary"
            aria-label={`Modifica ${supplier.name}`}
          >
            <Edit3 className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="grid size-9 place-items-center rounded-full text-beauty-muted transition hover:bg-beauty-danger/10 hover:text-beauty-danger"
            aria-label={`Elimina ${supplier.name}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {websiteUrl ? (
          <a href={websiteUrl} target="_blank" rel="noreferrer">
            <SecondaryButton type="button" className="h-9 px-3 text-[13px]">
              <Globe className="size-4" aria-hidden="true" />
              Apri sito
            </SecondaryButton>
          </a>
        ) : null}
        {catalogUrl ? (
          <a href={catalogUrl} target="_blank" rel="noreferrer">
            <SecondaryButton type="button" className="h-9 px-3 text-[13px]">
              <ExternalLink className="size-4" aria-hidden="true" />
              Apri catalogo
            </SecondaryButton>
          </a>
        ) : null}
        {phoneUrl ? (
          <a href={phoneUrl}>
            <SecondaryButton type="button" className="h-9 px-3 text-[13px]">
              <Phone className="size-4" aria-hidden="true" />
              Chiama
            </SecondaryButton>
          </a>
        ) : null}
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <SecondaryButton type="button" className="h-9 px-3 text-[13px]">
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp
            </SecondaryButton>
          </a>
        ) : null}
        {emailUrl ? (
          <a href={emailUrl}>
            <SecondaryButton type="button" className="h-9 px-3 text-[13px]">
              <Mail className="size-4" aria-hidden="true" />
              Email
            </SecondaryButton>
          </a>
        ) : null}
      </div>
    </Card>
  );
}
