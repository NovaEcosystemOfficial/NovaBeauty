import { ProfileForm } from "@/components/profile/ProfileForm";
import { TopHeader } from "@/components/layout/TopHeader";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Profilo" subtitle="Attivita' estetica" />
      <ProfileForm />
    </div>
  );
}
