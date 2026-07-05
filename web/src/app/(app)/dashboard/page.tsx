import {
  CalendarPlus,
  ChartNoAxesColumnIncreasing,
  Clock3,
  Gem,
  MessageCircle,
  Sparkles,
  Users
} from "lucide-react";
import { RevenueChartPlaceholder } from "@/components/dashboard/RevenueChartPlaceholder";
import { TodayAgenda } from "@/components/dashboard/TodayAgenda";
import { ActionTile } from "@/components/ui/ActionTile";
import { IconBadge } from "@/components/ui/IconBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-up">
      <section className="relative overflow-hidden rounded-beauty-xl border border-beauty-border/70 bg-beauty-elevated/90 p-5 shadow-beauty-floating backdrop-blur sm:p-7">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-beauty-border/70 bg-beauty-surface/75 px-3 py-1.5 text-[12px] font-semibold text-beauty-muted shadow-beauty-soft">
              <Sparkles aria-hidden="true" className="size-4 text-beauty-primary" />
              Studio estetico premium
            </div>
            <div>
              <p className="text-[15px] font-medium text-beauty-muted">Buongiorno, Sofia</p>
              <h1 className="mt-1 text-[34px] font-bold leading-[1.05] tracking-normal text-beauty-text sm:text-[44px]">
                La tua giornata e&apos; gia&apos; organizzata.
              </h1>
            </div>
            <p className="max-w-xl text-[15px] leading-6 text-beauty-muted">
              Agenda, performance e azioni rapide in una vista essenziale pensata per iniziare la giornata con chiarezza.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="button">
              <CalendarPlus aria-hidden="true" className="size-5" />
              Nuovo appuntamento
            </PrimaryButton>
            <SecondaryButton type="button">
              <ChartNoAxesColumnIncreasing aria-hidden="true" className="size-5" />
              Statistiche
            </SecondaryButton>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Clock3} label="Appuntamenti oggi" value="8" helper="3 ancora da completare" trend="+2" />
        <MetricCard icon={Gem} label="Incasso stimato" value="EUR 640" helper="Rispetto alla media giornaliera" tone="gold" trend="+12%" />
        <MetricCard icon={Users} label="Clienti attivi" value="124" helper="Aggiornati questo mese" tone="mint" />
        <MetricCard icon={Sparkles} label="Servizi top" value="Viso" helper="Categoria piu' richiesta" tone="lavender" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <TodayAgenda />
          <section className="space-y-3">
            <SectionHeader title="Pulsanti rapidi" caption="Le azioni piu' usate sempre a portata di mano" />
            <div className="grid gap-3 sm:grid-cols-3">
              <ActionTile icon={CalendarPlus} title="Appuntamento" caption="Crea una nuova prenotazione" />
              <ActionTile icon={Users} title="Cliente" caption="Aggiungi una nuova scheda" tone="mint" />
              <ActionTile icon={MessageCircle} title="Promemoria" caption="Prepara comunicazioni cliente" tone="lavender" />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <RevenueChartPlaceholder />
          <section className="rounded-beauty-xl border border-beauty-border/70 bg-beauty-elevated/85 p-5 shadow-beauty-soft">
            <div className="flex items-start gap-3">
              <IconBadge icon={Sparkles} tone="primary" className="animate-soft-pulse" />
              <div>
                <p className="text-[17px] font-bold text-beauty-text">Prossimi appuntamenti</p>
                <p className="mt-1 text-[13px] leading-5 text-beauty-muted">
                  Una sintesi compatta per preparare materiali, cabina e comunicazioni prima dell&apos;arrivo.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {["Trattamento viso", "Ceretta completa", "Check pelle"].map((label, index) => (
                <div key={label} className="flex items-center justify-between rounded-beauty bg-beauty-card/80 p-3">
                  <div>
                    <p className="text-[14px] font-semibold text-beauty-text">{label}</p>
                    <p className="text-[12px] text-beauty-muted">{["Domani", "Venerdi", "Lunedi"][index]}</p>
                  </div>
                  <span className="h-2 w-12 rounded-full bg-beauty-primary/40" />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
