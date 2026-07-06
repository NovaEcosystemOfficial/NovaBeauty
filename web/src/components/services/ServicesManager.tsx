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
import { CheckCircle2, Edit3, PackagePlus, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { DangerButton } from "@/components/ui/DangerButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FormField } from "@/components/ui/FormField";
import { IconBadge } from "@/components/ui/IconBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { servicesPath } from "@/lib/firebase/paths";
import type { ServiceDocument } from "@/types/firestore";

type ServiceItem = ServiceDocument & { id: string };

type ServiceFormState = {
  name: string;
  category: string;
  durationMinutes: string;
  price: string;
  description: string;
  active: boolean;
};

type TemplateService = {
  name: string;
  category: string;
  durationMinutes: number;
  description: string;
};

type TemplatePreviewItem = TemplateService & {
  id: string;
  selected: boolean;
  duplicate: boolean;
};

const templateId = "beauty-center-essential";

const essentialBeautyTemplate: TemplateService[] = [
  { name: "Pulizia viso base", category: "Viso", durationMinutes: 60, description: "Trattamento viso essenziale con detersione e riequilibrio." },
  { name: "Trattamento viso idratante", category: "Viso", durationMinutes: 60, description: "Trattamento pensato per pelle disidratata o spenta." },
  { name: "Trattamento viso purificante", category: "Viso", durationMinutes: 60, description: "Trattamento indicato per pelle impura o congestionata." },
  { name: "Massaggio viso", category: "Viso", durationMinutes: 30, description: "Massaggio rilassante e drenante per viso e collo." },
  { name: "Ceretta sopracciglia", category: "Epilazione", durationMinutes: 15, description: "Definizione sopracciglia con epilazione." },
  { name: "Ceretta baffetti", category: "Epilazione", durationMinutes: 10, description: "Epilazione zona labiale superiore." },
  { name: "Ceretta ascelle", category: "Epilazione", durationMinutes: 15, description: "Epilazione ascelle." },
  { name: "Ceretta braccia", category: "Epilazione", durationMinutes: 30, description: "Epilazione braccia." },
  { name: "Ceretta mezza gamba", category: "Epilazione", durationMinutes: 30, description: "Epilazione mezza gamba." },
  { name: "Ceretta gamba intera", category: "Epilazione", durationMinutes: 45, description: "Epilazione gamba completa." },
  { name: "Ceretta inguine", category: "Epilazione", durationMinutes: 25, description: "Epilazione inguine." },
  { name: "Manicure base", category: "Mani", durationMinutes: 40, description: "Cura estetica delle mani e delle unghie." },
  { name: "Applicazione semipermanente mani", category: "Mani", durationMinutes: 60, description: "Applicazione smalto semipermanente mani." },
  { name: "Rimozione semipermanente mani", category: "Mani", durationMinutes: 30, description: "Rimozione delicata dello smalto semipermanente." },
  { name: "Ricostruzione unghie gel", category: "Mani", durationMinutes: 120, description: "Servizio completo di ricostruzione unghie." },
  { name: "Refill gel", category: "Mani", durationMinutes: 90, description: "Ritocco periodico della ricostruzione gel." },
  { name: "Pedicure estetico", category: "Piedi", durationMinutes: 50, description: "Cura estetica dei piedi e delle unghie." },
  { name: "Pedicure con semipermanente", category: "Piedi", durationMinutes: 70, description: "Pedicure estetico con applicazione semipermanente." },
  { name: "Laminazione ciglia", category: "Ciglia e sopracciglia", durationMinutes: 60, description: "Trattamento per valorizzare la curvatura naturale delle ciglia." },
  { name: "Tinta ciglia", category: "Ciglia e sopracciglia", durationMinutes: 30, description: "Colorazione estetica delle ciglia." },
  { name: "Laminazione sopracciglia", category: "Ciglia e sopracciglia", durationMinutes: 45, description: "Trattamento per ordinare e valorizzare le sopracciglia." },
  { name: "Tinta sopracciglia", category: "Ciglia e sopracciglia", durationMinutes: 25, description: "Colorazione estetica delle sopracciglia." },
  { name: "Massaggio rilassante", category: "Massaggi", durationMinutes: 50, description: "Massaggio corpo a ritmo lento e distensivo." },
  { name: "Massaggio decontratturante", category: "Massaggi", durationMinutes: 50, description: "Massaggio mirato alle tensioni muscolari." },
  { name: "Massaggio drenante", category: "Massaggi", durationMinutes: 50, description: "Massaggio corpo con manualita drenanti." },
  { name: "Trattamento corpo scrub", category: "Corpo", durationMinutes: 45, description: "Esfoliazione corpo per rendere la pelle piu liscia." },
  { name: "Trattamento corpo idratante", category: "Corpo", durationMinutes: 60, description: "Trattamento corpo nutriente e idratante." },
  { name: "Bendaggio corpo", category: "Corpo", durationMinutes: 60, description: "Trattamento corpo con bendaggi estetici." },
  { name: "Pressoterapia", category: "Corpo", durationMinutes: 45, description: "Seduta corpo con apparecchiatura pressoria." },
  { name: "Consulenza estetica", category: "Consulenza", durationMinutes: 20, description: "Incontro iniziale per valutare percorso e trattamenti." }
];

const emptyForm: ServiceFormState = {
  name: "",
  category: "",
  durationMinutes: "60",
  price: "",
  description: "",
  active: true
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function formatPrice(price: number | null | undefined) {
  if (typeof price !== "number") {
    return "Prezzo da impostare";
  }

  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(price);
}

export function ServicesManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<TemplatePreviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const collectionPath = useMemo(() => (user ? servicesPath(user.uid) : null), [user]);
  const isEditing = Boolean(editingServiceId);

  useEffect(() => {
    if (!collectionPath) {
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, collectionPath), orderBy("category", "asc"), orderBy("name", "asc")),
      (snapshot) => {
        setServices(snapshot.docs.map((serviceDoc) => ({ id: serviceDoc.id, ...(serviceDoc.data() as ServiceDocument) })));
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Services subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare i servizi.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath]);

  const filteredServices = useMemo(() => {
    const term = normalize(search);
    return services.filter((service) => normalize(`${service.name} ${service.category} ${service.description ?? ""}`).includes(term));
  }, [search, services]);

  const categories = useMemo(() => Array.from(new Set(filteredServices.map((service) => service.category || "Senza categoria"))), [filteredServices]);

  function hasDuplicate(name: string, excludedServiceId?: string) {
    const normalizedName = normalize(name);
    return services.some((service) => service.id !== excludedServiceId && normalize(service.name) === normalizedName);
  }

  function updateField(field: keyof ServiceFormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }

  function openNewServiceForm() {
    setEditingServiceId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditServiceForm(service: ServiceItem) {
    setEditingServiceId(service.id);
    setForm({
      name: service.name,
      category: service.category ?? "",
      durationMinutes: String(service.durationMinutes ?? 60),
      price: typeof service.price === "number" ? String(service.price) : "",
      description: service.description ?? "",
      active: service.active ?? true
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingServiceId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !collectionPath) {
      setError("Sessione non valida. Accedi di nuovo.");
      return;
    }

    if (!form.name.trim() || !form.category.trim() || !Number(form.durationMinutes)) {
      setError("Compila nome, categoria e durata.");
      return;
    }

    if (hasDuplicate(form.name, editingServiceId ?? undefined)) {
      setError("Esiste gia un servizio con questo nome.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      ownerId: user.uid,
      name: form.name.trim(),
      category: form.category.trim(),
      durationMinutes: Number(form.durationMinutes),
      price: form.price === "" ? null : Number(form.price),
      description: form.description.trim() || null,
      active: form.active,
      source: "manual" as const,
      templateId: null,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingServiceId) {
        await updateDoc(doc(db, collectionPath, editingServiceId), payload);
        setSuccess("Servizio aggiornato.");
        showToast("Servizio aggiornato.");
      } else {
        const serviceRef = doc(collection(db, collectionPath));
        await setDoc(serviceRef, {
          ...payload,
          syncId: serviceRef.id,
          createdAt: serverTimestamp()
        });
        setSuccess("Servizio creato.");
        showToast("Servizio creato.");
      }

      closeForm();
    } catch (saveError) {
      console.error("Service save failed", saveError);
      setError("Non siamo riusciti a salvare il servizio.");
      showToast("Servizio non salvato.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(service: ServiceItem) {
    if (!collectionPath) {
      return;
    }

    if (!window.confirm(`Eliminare ${service.name}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, collectionPath, service.id));
      setSuccess("Servizio eliminato.");
      showToast("Servizio eliminato.");
    } catch (deleteError) {
      console.error("Service delete failed", deleteError);
      setError("Non siamo riusciti a eliminare il servizio.");
      showToast("Servizio non eliminato.", "error");
    }
  }

  function openTemplatePreview() {
    setTemplatePreview(
      essentialBeautyTemplate.map((service, index) => ({
        ...service,
        id: `${templateId}-${index}`,
        selected: !hasDuplicate(service.name),
        duplicate: hasDuplicate(service.name)
      }))
    );
    setError("");
    setSuccess("");
  }

  async function importSelectedTemplateServices() {
    if (!user || !collectionPath) {
      return;
    }

    const selectedServices = templatePreview.filter((service) => service.selected && !service.duplicate);
    if (!selectedServices.length) {
      setError("Seleziona almeno un servizio non duplicato.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await Promise.all(
        selectedServices.map((service) => {
          const serviceRef = doc(collection(db, collectionPath));
          return setDoc(serviceRef, {
            ownerId: user.uid,
            syncId: serviceRef.id,
            name: service.name,
            category: service.category,
            durationMinutes: service.durationMinutes,
            price: null,
            description: service.description,
            active: true,
            source: "template",
            templateId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        })
      );

      setTemplatePreview([]);
      setSuccess("Template servizi importato. Ora puoi impostare i prezzi.");
      showToast("Template servizi importato.");
    } catch (templateError) {
      console.error("Service template import failed", templateError);
      setError("Non siamo riusciti a importare il template.");
      showToast("Template non importato.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-beauty-muted">Crea il catalogo trattamenti. I prezzi restano da impostare da chi usa l&apos;app.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SecondaryButton type="button" onClick={openTemplatePreview}>
            <PackagePlus className="size-5" aria-hidden="true" />
            Importa template
          </SecondaryButton>
          <PrimaryButton type="button" onClick={openNewServiceForm}>
            <Plus className="size-5" aria-hidden="true" />
            Nuovo servizio
          </PrimaryButton>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <IconBadge icon={Sparkles} tone="gold" />
          <div>
            <p className="text-[16px] font-bold text-beauty-text">Template Centro estetico essenziale</p>
            <p className="mt-1 text-[13px] leading-5 text-beauty-muted">
              Importa servizi comuni con durata e descrizione. Il prezzo resta vuoto e va inserito dallo studio.
            </p>
          </div>
        </div>
      </Card>

      <Card className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-beauty-muted" />
          <input
            className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card pl-10 pr-3 text-[15px] text-beauty-text outline-none transition focus:border-beauty-primary focus:bg-beauty-surface"
            placeholder="Cerca servizio o categoria"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="rounded-beauty border border-beauty-border bg-beauty-card px-3 py-2 text-[13px] text-beauty-muted">
          {services.length} servizi totali
        </div>
      </Card>

      {templatePreview.length ? (
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold">Preview template</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">Seleziona i servizi da importare. I duplicati sono esclusi.</p>
            </div>
            <SecondaryButton type="button" onClick={() => setTemplatePreview([])} className="h-10 px-3">
              <X className="size-4" aria-hidden="true" />
            </SecondaryButton>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {templatePreview.map((service) => (
              <label key={service.id} className="flex items-start gap-3 rounded-beauty bg-beauty-card p-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={service.selected}
                  disabled={service.duplicate}
                  onChange={(event) =>
                    setTemplatePreview((current) =>
                      current.map((item) => (item.id === service.id ? { ...item, selected: event.target.checked } : item))
                    )
                  }
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-beauty-text">{service.name}</span>
                  <span className="block text-[13px] text-beauty-muted">
                    {service.category} - {service.durationMinutes} min - prezzo da impostare
                  </span>
                  {service.duplicate ? <span className="text-[12px] text-beauty-danger">Duplicato rilevato</span> : null}
                </span>
              </label>
            ))}
          </div>
          <PrimaryButton type="button" onClick={importSelectedTemplateServices} disabled={isSubmitting}>
            {isSubmitting ? "Importazione..." : "Importa selezionati"}
          </PrimaryButton>
        </Card>
      ) : null}

      {isFormOpen ? (
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold">{isEditing ? "Modifica servizio" : "Nuovo servizio"}</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">Il prezzo puo restare vuoto finche non viene deciso dallo studio.</p>
            </div>
            <SecondaryButton type="button" onClick={closeForm} className="h-10 px-3">
              <X className="size-4" aria-hidden="true" />
            </SecondaryButton>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nome servizio" name="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required disabled={isSubmitting} />
              <FormField label="Categoria" name="category" value={form.category} onChange={(event) => updateField("category", event.target.value)} required disabled={isSubmitting} />
              <FormField label="Durata minuti" name="durationMinutes" type="number" min={5} step={5} value={form.durationMinutes} onChange={(event) => updateField("durationMinutes", event.target.value)} required disabled={isSubmitting} />
              <FormField label="Prezzo" name="price" type="number" min={0} step="0.01" value={form.price} onChange={(event) => updateField("price", event.target.value)} placeholder="Da impostare" disabled={isSubmitting} />
            </div>
            <TextAreaField label="Descrizione" name="description" value={form.description} onChange={(event) => updateField("description", event.target.value)} disabled={isSubmitting} />
            <label className="flex items-center gap-3 text-[14px] font-semibold text-beauty-text">
              <input type="checkbox" checked={form.active} onChange={(event) => updateField("active", event.target.checked)} disabled={isSubmitting} />
              Servizio attivo
            </label>
            <PrimaryButton type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvataggio..." : "Salva servizio"}</PrimaryButton>
          </form>
        </Card>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState title="Nessun servizio" description={search ? "Nessun servizio corrisponde alla ricerca." : "Importa un template o crea il primo servizio."} />
      ) : (
        <div className="space-y-5">
          {categories.map((category) => (
            <section key={category} className="space-y-3">
              <h2 className="text-[18px] font-bold text-beauty-text">{category}</h2>
              <div className="grid gap-3">
                {filteredServices
                  .filter((service) => (service.category || "Senza categoria") === category)
                  .map((service) => (
                    <Card key={service.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <IconBadge icon={service.active === false ? X : CheckCircle2} tone={service.active === false ? "lavender" : "mint"} />
                        <div className="min-w-0">
                          <p className="truncate text-[17px] font-semibold text-beauty-text">{service.name}</p>
                          <p className="mt-1 text-[13px] text-beauty-muted">
                            {service.durationMinutes} min - {formatPrice(service.price)}
                          </p>
                          {service.description ? <p className="mt-2 text-[13px] leading-5 text-beauty-subtle">{service.description}</p> : null}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <SecondaryButton type="button" onClick={() => openEditServiceForm(service)} className="h-10 px-3">
                          <Edit3 className="size-4" aria-hidden="true" />
                          Modifica
                        </SecondaryButton>
                        <DangerButton type="button" onClick={() => handleDelete(service)} className="h-10 px-3">
                          <Trash2 className="size-4" aria-hidden="true" />
                          Elimina
                        </DangerButton>
                      </div>
                    </Card>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
