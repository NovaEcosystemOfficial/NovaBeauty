"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/constants/routes";
import { getReadableAuthError } from "@/lib/firebase/errors";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(email, password);
      router.replace(routes.dashboard);
    } catch (authError) {
      setError(getReadableAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold">Registrati</h1>
        <p className="text-[15px] text-beauty-muted">
          Crea il tuo account e prepara il profilo attivita&apos;.
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
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? <ErrorMessage message={error} /> : null}
        <PrimaryButton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creazione in corso..." : "Crea account"}
        </PrimaryButton>
      </form>
      <p className="text-center text-[13px] text-beauty-muted">
        Hai gia&apos; un account?{" "}
        <Link className="font-semibold text-beauty-primary" href={routes.login}>
          Accedi
        </Link>
      </p>
    </div>
  );
}
