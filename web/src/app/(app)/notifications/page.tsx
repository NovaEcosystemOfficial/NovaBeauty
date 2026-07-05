import { NotificationsCenter } from "@/components/notifications/NotificationsCenter";
import { TopHeader } from "@/components/layout/TopHeader";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <TopHeader title="Notifiche" subtitle="Centro notifiche NovaBeauty" />
      <NotificationsCenter />
    </div>
  );
}
