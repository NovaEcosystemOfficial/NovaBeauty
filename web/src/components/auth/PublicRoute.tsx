"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { routes } from "@/lib/constants/routes";

type PublicRouteProps = {
  children: ReactNode;
};

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(routes.dashboard);
    }
  }, [loading, router, user]);

  if (loading || user) {
    return (
      <div className="grid min-h-dvh place-items-center px-4">
        <LoadingState label="Controllo sessione..." />
      </div>
    );
  }

  return children;
}
