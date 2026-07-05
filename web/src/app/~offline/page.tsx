import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-beauty-background px-4 py-10 text-beauty-text">
      <Card className="max-w-md space-y-5 text-center">
        <div className="flex justify-center">
          <IconBadge icon={WifiOff} tone="primary" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold">NovaBeauty e&apos; offline</h1>
          <p className="mt-2 text-[14px] leading-6 text-beauty-muted">
            Controlla la connessione e riapri la dashboard. I dati reali verranno aggiornati appena torni online.
          </p>
        </div>
        <Link href="/dashboard">
          <SecondaryButton type="button">Torna alla dashboard</SecondaryButton>
        </Link>
      </Card>
    </main>
  );
}
