"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/constants/routes";
import { getReadableAuthError } from "@/lib/firebase/errors";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setSuccess("Email di recupero inviata. Controlla la tua casella di posta.");
    } catch (authError) {
      setError(getReadableAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold">Recupera password</h1>
        <p className="text-[15px] text-beauty-muted">
          Riceverai un link Firebase per impostare una nuova password.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {error ? <ErrorMessage message={error} /> : null}
        {success ? <SuccessMessage message={success} /> : null}
        <PrimaryButton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Invio in corso..." : "Invia email reset"}
        </PrimaryButton>
      </form>
      <p className="text-center text-[13px] text-beauty-muted">
        Torna al{" "}
        <Link className="font-semibold text-beauty-primary" href={routes.login}>
          login
        </Link>
      </p>
    </div>
  );
}
