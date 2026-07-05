"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState, type FormEvent } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FormField } from "@/components/ui/FormField";
import { LoadingState } from "@/components/ui/LoadingState";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { profilePath } from "@/lib/firebase/paths";
import type { ProfileDocument } from "@/types/firestore";

type ProfileFormState = {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  email: string;
  description: string;
};

const initialForm: ProfileFormState = {
  businessName: "",
  ownerName: "",
  phone: "",
  address: "",
  email: "",
  description: ""
};

export function ProfileForm() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const profileRef = doc(db, profilePath(user.uid));
        const snapshot = await getDoc(profileRef);
        const data = snapshot.exists() ? (snapshot.data() as Partial<ProfileDocument>) : null;

        if (!isActive) {
          return;
        }

        setForm({
          businessName: data?.businessName ?? "",
          ownerName: data?.ownerName ?? data?.displayName ?? user.displayName ?? "",
          phone: data?.phone ?? "",
          address: data?.address ?? "",
          email: data?.email ?? user.email ?? "",
          description: data?.description ?? ""
        });
      } catch (loadError) {
        console.error("Profile load failed", loadError);
        if (isActive) {
          setError("Non siamo riusciti a caricare il profilo. Controlla la connessione e riprova.");
          showToast("Non siamo riusciti a caricare il profilo.", "error");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [showToast, user]);

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("Sessione non valida. Accedi di nuovo per salvare il profilo.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await setDoc(
        doc(db, profilePath(user.uid)),
        {
          ownerId: user.uid,
          businessName: form.businessName.trim(),
          ownerName: form.ownerName.trim(),
          displayName: form.ownerName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          email: form.email.trim(),
          description: form.description.trim(),
          businessType: "estetica",
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      setSuccess("Profilo salvato correttamente.");
      showToast("Profilo salvato correttamente.");
    } catch (saveError) {
      console.error("Profile save failed", saveError);
      setError("Non siamo riusciti a salvare il profilo. Controlla i dati e riprova.");
      showToast("Non siamo riusciti a salvare il profilo.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <LoadingState label="Caricamento profilo..." />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-5">
        <div>
          <h2 className="text-[20px] font-semibold">Dati attivita&apos;</h2>
          <p className="mt-1 text-[14px] text-beauty-muted">
            Queste informazioni personalizzano NovaBeauty e restano nel namespace della tua app.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Nome attivita'"
              name="businessName"
              value={form.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
              placeholder="Nome del tuo studio"
              disabled={isSubmitting}
              required
            />
            <FormField
              label="Nome titolare"
              name="ownerName"
              value={form.ownerName}
              onChange={(event) => updateField("ownerName", event.target.value)}
              placeholder="Nome e cognome"
              disabled={isSubmitting}
              required
            />
            <FormField
              label="Telefono"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+39 333 000 0000"
              disabled={isSubmitting}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="studio@example.com"
              disabled={isSubmitting}
            />
          </div>

          <FormField
            label="Indirizzo"
            name="address"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            placeholder="Via, citta', provincia"
            disabled={isSubmitting}
          />

          <TextAreaField
            label="Descrizione breve"
            name="description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Racconta in poche parole stile, servizi e identita' del tuo centro."
            disabled={isSubmitting}
          />

          {error ? <ErrorMessage message={error} /> : null}
          {success ? <SuccessMessage message={success} /> : null}

          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvataggio..." : "Salva profilo"}
          </PrimaryButton>
        </form>
      </Card>

      <LogoutButton />
    </div>
  );
}
