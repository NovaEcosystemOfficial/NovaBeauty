"use client";

import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { routes } from "@/lib/constants/routes";

export function MyStudioPage() {
  return (
    <div className="space-y-6">
      <SubpageHeader
        title="Il mio studio"
        subtitle="Dati, contatti e informazioni dell'attività."
        backHref={routes.studio}
      />
      <ProfileForm />
    </div>
  );
}
