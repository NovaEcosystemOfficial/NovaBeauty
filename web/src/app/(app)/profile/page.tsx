import { LogoutButton } from "@/components/auth/LogoutButton";
import { TopHeader } from "@/components/layout/TopHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Profilo" subtitle="Attivita' estetica" />
      <EmptyState title="Profilo da completare" description="Dati e immagine profilo saranno salvati in Firebase." />
      <LogoutButton />
    </div>
  );
}
