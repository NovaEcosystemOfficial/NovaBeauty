"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { FormField } from "@/components/ui/FormField";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/contexts/AuthContext";
import { getReadableAuthError } from "@/lib/firebase/errors";
import { routes } from "@/lib/constants/routes";

export default function LoginPage() {
  const { login } = useAuth();
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
      await login(email, password);
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next") || routes.dashboard;
      router.replace(next.startsWith("/") ? next : routes.dashboard);
    } catch (authError) {
      setError(getReadableAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold">Accedi</h1>
        <p className="text-[15px] text-beauty-muted">
          Entra nel tuo spazio NovaBeauty con email e password.
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? <ErrorMessage message={error} /> : null}
        <PrimaryButton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Accesso in corso..." : "Accedi"}
        </PrimaryButton>
      </form>
      <div className="space-y-2 text-center text-[13px] text-beauty-muted">
        <Link className="font-semibold text-beauty-primary" href={routes.resetPassword}>
          Password dimenticata?
        </Link>
        <p>
          Non hai un account?{" "}
          <Link className="font-semibold text-beauty-primary" href={routes.register}>
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
