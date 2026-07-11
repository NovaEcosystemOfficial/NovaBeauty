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
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { StockStatusBadge } from "@/components/magazzino/StockStatusBadge";
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
import { productsPath, suppliersPath } from "@/lib/firebase/paths";
import type { MagazzinoProductDocument, SupplierDocument } from "@/types/firestore";

type ProductItem = MagazzinoProductDocument & { id: string };
type SupplierItem = SupplierDocument & { id: string };

type ProductFormState = {
  name: string;
  brand: string;
  category: string;
  supplierId: string;
  quantity: string;
  minimumQuantity: string;
  purchasePrice: string;
  batchNumber: string;
  expiryDate: string;
  internalCode: string;
  barcode: string;
  notes: string;
};

const emptyForm: ProductFormState = {
  name: "",
  brand: "",
  category: "",
  supplierId: "",
  quantity: "0",
  minimumQuantity: "0",
  purchasePrice: "",
  batchNumber: "",
  expiryDate: "",
  internalCode: "",
  barcode: "",
  notes: ""
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function parseNonNegativeNumber(value: string, fieldLabel: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldLabel} deve essere un numero valido maggiore o uguale a zero.`);
  }

  return parsed;
}

function parseOptionalPrice(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function ProductsManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const productsCollectionPath = useMemo(() => (user ? productsPath(user.uid) : null), [user]);
  const suppliersCollectionPath = useMemo(() => (user ? suppliersPath(user.uid) : null), [user]);
  const suppliersById = useMemo(() => new Map(suppliers.map((supplier) => [supplier.id, supplier])), [suppliers]);

  useEffect(() => {
    if (!productsCollectionPath) {
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, productsCollectionPath), orderBy("name", "asc")),
      (snapshot) => {
        setProducts(snapshot.docs.map((productDoc) => ({ id: productDoc.id, ...(productDoc.data() as MagazzinoProductDocument) })));
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Products subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare i prodotti.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [productsCollectionPath]);

  useEffect(() => {
    if (!suppliersCollectionPath) {
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, suppliersCollectionPath), orderBy("name", "asc")),
      (snapshot) => {
        setSuppliers(snapshot.docs.map((supplierDoc) => ({ id: supplierDoc.id, ...(supplierDoc.data() as SupplierDocument) })));
      },
      (snapshotError) => {
        console.error("Suppliers subscription failed", snapshotError);
      }
    );

    return unsubscribe;
  }, [suppliersCollectionPath]);

  const filteredProducts = useMemo(() => {
    const term = normalize(search);
    if (!term) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.brand ?? "",
        product.category ?? "",
        product.supplierNameSnapshot ?? "",
        product.internalCode ?? "",
        product.barcode ?? ""
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [products, search]);

  function updateField(field: keyof ProductFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }

  function openNewProductForm() {
    setEditingProductId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditProductForm(product: ProductItem) {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      brand: product.brand ?? "",
      category: product.category ?? "",
      supplierId: product.supplierId ?? "",
      quantity: String(product.quantity ?? 0),
      minimumQuantity: String(product.minimumQuantity ?? 0),
      purchasePrice: typeof product.purchasePrice === "number" ? String(product.purchasePrice) : "",
      batchNumber: product.batchNumber ?? "",
      expiryDate: product.expiryDate ?? "",
      internalCode: product.internalCode ?? "",
      barcode: product.barcode ?? "",
      notes: product.notes ?? ""
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingProductId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !productsCollectionPath) {
      setError("Sessione non valida. Accedi di nuovo.");
      return;
    }

    if (!form.name.trim()) {
      setError("Il nome del prodotto e' obbligatorio.");
      return;
    }

    let quantity = 0;
    let minimumQuantity = 0;

    try {
      quantity = parseNonNegativeNumber(form.quantity, "La quantita' disponibile");
      minimumQuantity = parseNonNegativeNumber(form.minimumQuantity, "La quantita' minima");
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Valori numerici non validi.");
      return;
    }

    const purchasePrice = parseOptionalPrice(form.purchasePrice);
    if (form.purchasePrice.trim() && purchasePrice === null) {
      setError("Il prezzo di acquisto deve essere un numero valido oppure lasciato vuoto.");
      return;
    }

    const selectedSupplier = form.supplierId ? suppliersById.get(form.supplierId) : undefined;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      ownerId: user.uid,
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      category: form.category.trim() || null,
      supplierId: selectedSupplier?.id ?? null,
      supplierNameSnapshot: selectedSupplier?.name ?? null,
      quantity,
      minimumQuantity,
      purchasePrice,
      batchNumber: form.batchNumber.trim() || null,
      expiryDate: form.expiryDate.trim() || null,
      internalCode: form.internalCode.trim() || null,
      barcode: form.barcode.trim() || null,
      notes: form.notes.trim() || null,
      active: true,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingProductId) {
        await updateDoc(doc(db, productsCollectionPath, editingProductId), payload);
        setSuccess("Prodotto aggiornato.");
        showToast("Prodotto aggiornato.");
      } else {
        const productRef = doc(collection(db, productsCollectionPath));
        await setDoc(productRef, {
          ...payload,
          syncId: productRef.id,
          createdAt: serverTimestamp()
        });
        setSuccess("Prodotto creato.");
        showToast("Prodotto creato.");
      }

      closeForm();
    } catch (saveError) {
      console.error("Product save failed", saveError);
      setError("Non siamo riusciti a salvare il prodotto.");
      showToast("Prodotto non salvato.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(product: ProductItem) {
    if (!productsCollectionPath) {
      return;
    }

    if (!window.confirm(`Eliminare ${product.name}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, productsCollectionPath, product.id));
      setSuccess("Prodotto eliminato.");
      showToast("Prodotto eliminato.");
    } catch (deleteError) {
      console.error("Product delete failed", deleteError);
      setError("Non siamo riusciti a eliminare il prodotto.");
      showToast("Prodotto non eliminato.", "error");
    }
  }

  return (
    <div className="space-y-5">
      <SubpageHeader
        title="Prodotti"
        subtitle="Tutti i prodotti utilizzati nel centro."
        backHref={routes.studioMagazzino}
      />

      <div className="flex flex-wrap gap-2">
        <PrimaryButton type="button" onClick={openNewProductForm} className="h-10 px-3">
          <Plus className="size-4" aria-hidden="true" />
          Nuovo prodotto
        </PrimaryButton>
      </div>

      {isFormOpen ? (
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-bold text-beauty-text">{editingProductId ? "Modifica prodotto" : "Nuovo prodotto"}</h2>
            <button type="button" onClick={closeForm} className="grid size-8 place-items-center rounded-full text-beauty-muted transition hover:bg-beauty-card">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="Nome" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Marca" value={form.brand} onChange={(event) => updateField("brand", event.target.value)} />
              <FormField label="Categoria" value={form.category} onChange={(event) => updateField("category", event.target.value)} />
            </div>
            <label className="block space-y-1.5">
              <span className="text-[13px] font-semibold text-beauty-text">Fornitore</span>
              <select
                className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card px-3 text-[15px] text-beauty-text outline-none transition focus:border-beauty-primary focus:bg-beauty-surface"
                value={form.supplierId}
                onChange={(event) => updateField("supplierId", event.target.value)}
              >
                <option value="">Nessun fornitore</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Quantita' disponibile" type="number" min="0" value={form.quantity} onChange={(event) => updateField("quantity", event.target.value)} />
              <FormField label="Quantita' minima" type="number" min="0" value={form.minimumQuantity} onChange={(event) => updateField("minimumQuantity", event.target.value)} />
            </div>
            <FormField label="Prezzo acquisto" type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(event) => updateField("purchasePrice", event.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Lotto" value={form.batchNumber} onChange={(event) => updateField("batchNumber", event.target.value)} />
              <FormField label="Scadenza" type="date" value={form.expiryDate} onChange={(event) => updateField("expiryDate", event.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Codice interno" value={form.internalCode} onChange={(event) => updateField("internalCode", event.target.value)} />
              <FormField label="Codice a barre" value={form.barcode} onChange={(event) => updateField("barcode", event.target.value)} />
            </div>
            <TextAreaField label="Note" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} />
            {error ? <ErrorMessage message={error} /> : null}
            {success ? <SuccessMessage message={success} /> : null}
            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {editingProductId ? "Salva modifiche" : "Crea prodotto"}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={closeForm}>
                Annulla
              </SecondaryButton>
            </div>
          </form>
        </Card>
      ) : null}

      {products.length > 0 ? (
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-beauty-muted" />
          <input
            className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card pl-10 pr-3 text-[15px] text-beauty-text outline-none transition focus:border-beauty-primary focus:bg-beauty-surface"
            placeholder="Cerca per nome, marca, categoria o codice"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      ) : null}

      {error && !isFormOpen ? <ErrorMessage message={error} /> : null}
      {success && !isFormOpen ? <SuccessMessage message={success} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="Nessun prodotto"
          description={search ? "Nessun prodotto corrisponde alla ricerca." : "Aggiungi il primo prodotto per iniziare a organizzare il magazzino."}
        />
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[16px] font-bold text-beauty-text">{product.name}</p>
                    <StockStatusBadge quantity={product.quantity ?? 0} minimumQuantity={product.minimumQuantity ?? 0} />
                  </div>
                  {product.brand ? <p className="mt-1 text-[14px] text-beauty-muted">{product.brand}</p> : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEditProductForm(product)}
                    className="grid size-9 place-items-center rounded-full text-beauty-muted transition hover:bg-beauty-card hover:text-beauty-primary"
                    aria-label={`Modifica ${product.name}`}
                  >
                    <Edit3 className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    className="grid size-9 place-items-center rounded-full text-beauty-muted transition hover:bg-beauty-danger/10 hover:text-beauty-danger"
                    aria-label={`Elimina ${product.name}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="grid gap-1 text-[13px] text-beauty-muted">
                <p>Quantità: {product.quantity ?? 0}</p>
                <p>Fornitore: {product.supplierNameSnapshot || "Non assegnato"}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
