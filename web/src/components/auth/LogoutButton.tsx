"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DangerButton } from "@/components/ui/DangerButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/contexts/AuthContext";
import { getReadableAuthError } from "@/lib/firebase/errors";
import { routes } from "@/lib/constants/routes";

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setError("");
    setIsSubmitting(true);

    try {
      await logout();
      router.replace(routes.login);
    } catch (authError) {
      setError(getReadableAuthError(authError));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <DangerButton type="button" className="w-full" disabled={isSubmitting} onClick={handleLogout}>
        <LogOut aria-hidden="true" className="size-5" />
        {isSubmitting ? "Uscita in corso..." : "Logout"}
      </DangerButton>
      {error ? <ErrorMessage message={error} /> : null}
    </div>
  );
}
