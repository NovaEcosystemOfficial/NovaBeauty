import { NotificationsCenter } from "@/components/notifications/NotificationsCenter";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { routes } from "@/lib/constants/routes";

export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <SubpageHeader title="Notifiche" subtitle="Push, promemoria e cronologia" backHref={routes.studio} />
      <NotificationsCenter />
    </div>
  );
}
