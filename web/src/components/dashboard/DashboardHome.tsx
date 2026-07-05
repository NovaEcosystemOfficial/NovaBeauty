"use client";

import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Euro,
  Gem,
  Scissors,
  Sparkles,
  Store,
  UserRound,
  Users
} from "lucide-react";
import {
  Timestamp,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconBadge } from "@/components/ui/IconBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/client";
import { appointmentsPath, clientsPath, profilePath, servicesPath } from "@/lib/firebase/paths";
import type { AppointmentDocument, ClientDocument, ProfileDocument, ServiceDocument } from "@/types/firestore";

type DashboardAppointment = AppointmentDocument & {
  id: string;
};

type DashboardState = {
  profile: Partial<ProfileDocument> | null;
  clients: ClientDocument[];
  services: ServiceDocument[];
  todayAppointments: DashboardAppointment[];
  weekAppointments: DashboardAppointment[];
  upcomingAppointments: DashboardAppointment[];
};

const initialDashboardState: DashboardState = {
  profile: null,
  clients: [],
  services: [],
  todayAppointments: [],
  weekAppointments: [],
  upcomingAppointments: []
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfTomorrow() {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
}

function startOfWeek() {
  const date = startOfToday();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatAppointmentTime(timestamp: Timestamp) {
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(timestamp.toDate());
}

function formatAppointmentDay(timestamp: Timestamp) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(timestamp.toDate());
}

export function DashboardHome() {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>(initialDashboardState);
  const [loadingSections, setLoadingSections] = useState({
    profile: true,
    clients: true,
    services: true,
    todayAppointments: true,
    weekAppointments: true,
    upcomingAppointments: true
  });
  const [error, setError] = useState("");

  const profileComplete = Boolean(
    state.profile?.businessName && state.profile?.ownerName && state.profile?.email && state.profile?.phone
  );

  const profileTitle = state.profile?.businessName || "Benvenuto in NovaBeauty.";
  const ownerName = state.profile?.ownerName || state.profile?.displayName || user?.displayName || "";
  const greeting = profileComplete
    ? ownerName
      ? `Ciao ${ownerName}, ecco la situazione reale del tuo studio.`
      : "Ecco la situazione reale del tuo studio."
    : "Completa il profilo per iniziare.";

  const setupActions = useMemo(
    () => [
      {
        title: "Completa il profilo",
        description: "Aggiungi dati attivita', titolare e contatti.",
        href: "/profile",
        done: profileComplete
      },
      {
        title: "Aggiungi il primo cliente",
        description: "Crea una scheda cliente da usare nei test reali.",
        href: "/clients",
        done: state.clients.length > 0
      },
      {
        title: "Crea il primo servizio",
        description: "Prepara il catalogo trattamenti per l'agenda.",
        href: "/services",
        done: state.services.length > 0
      },
      {
        title: "Programma il primo appuntamento",
        description: "Collega cliente, servizio e orario in agenda.",
        href: "/appointments",
        done: state.upcomingAppointments.length > 0 || state.todayAppointments.length > 0
      }
    ],
    [profileComplete, state.clients.length, state.services.length, state.todayAppointments.length, state.upcomingAppointments.length]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    setError("");
    const todayStart = Timestamp.fromDate(startOfToday());
    const tomorrowStart = Timestamp.fromDate(startOfTomorrow());
    const weekStart = Timestamp.fromDate(startOfWeek());

    const unsubscribers = [
      onSnapshot(
        doc(db, profilePath(user.uid)),
        (snapshot) => {
          setState((current) => ({
            ...current,
            profile: snapshot.exists() ? (snapshot.data() as Partial<ProfileDocument>) : null
          }));
          setLoadingSections((current) => ({ ...current, profile: false }));
        },
        (snapshotError) => {
          console.error("Dashboard profile subscription failed", snapshotError);
          setError("Non siamo riusciti ad aggiornare la dashboard. Riprova tra poco.");
          setLoadingSections((current) => ({ ...current, profile: false }));
        }
      ),
      onSnapshot(
        query(collection(db, clientsPath(user.uid)), orderBy("name", "asc"), limit(100)),
        (snapshot) => {
          setState((current) => ({
            ...current,
            clients: snapshot.docs.map((clientDoc) => clientDoc.data() as ClientDocument)
          }));
          setLoadingSections((current) => ({ ...current, clients: false }));
        },
        (snapshotError) => {
          console.error("Dashboard clients subscription failed", snapshotError);
          setError("Non siamo riusciti ad aggiornare la dashboard. Riprova tra poco.");
          setLoadingSections((current) => ({ ...current, clients: false }));
        }
      ),
      onSnapshot(
        query(collection(db, servicesPath(user.uid)), orderBy("name", "asc"), limit(100)),
        (snapshot) => {
          setState((current) => ({
            ...current,
            services: snapshot.docs.map((serviceDoc) => serviceDoc.data() as ServiceDocument)
          }));
          setLoadingSections((current) => ({ ...current, services: false }));
        },
        (snapshotError) => {
          console.error("Dashboard services subscription failed", snapshotError);
          setError("Non siamo riusciti ad aggiornare la dashboard. Riprova tra poco.");
          setLoadingSections((current) => ({ ...current, services: false }));
        }
      ),
      onSnapshot(
        query(
          collection(db, appointmentsPath(user.uid)),
          where("date", ">=", todayStart),
          where("date", "<", tomorrowStart),
          orderBy("date", "asc")
        ),
        (snapshot) => {
          setState((current) => ({
            ...current,
            todayAppointments: snapshot.docs.map((appointmentDoc) => ({
              id: appointmentDoc.id,
              ...(appointmentDoc.data() as AppointmentDocument)
            }))
          }));
          setLoadingSections((current) => ({ ...current, todayAppointments: false }));
        },
        (snapshotError) => {
          console.error("Dashboard today appointments subscription failed", snapshotError);
          setError("Non siamo riusciti ad aggiornare la dashboard. Riprova tra poco.");
          setLoadingSections((current) => ({ ...current, todayAppointments: false }));
        }
      ),
      onSnapshot(
        query(collection(db, appointmentsPath(user.uid)), where("date", ">=", todayStart), orderBy("date", "asc"), limit(5)),
        (snapshot) => {
          setState((current) => ({
            ...current,
            upcomingAppointments: snapshot.docs.map((appointmentDoc) => ({
              id: appointmentDoc.id,
              ...(appointmentDoc.data() as AppointmentDocument)
            }))
          }));
          setLoadingSections((current) => ({ ...current, upcomingAppointments: false }));
        },
        (snapshotError) => {
          console.error("Dashboard upcoming appointments subscription failed", snapshotError);
          setError("Non siamo riusciti ad aggiornare la dashboard. Riprova tra poco.");
          setLoadingSections((current) => ({ ...current, upcomingAppointments: false }));
        }
      ),
      onSnapshot(
        query(collection(db, appointmentsPath(user.uid)), where("date", ">=", weekStart), orderBy("date", "asc"), limit(200)),
        (snapshot) => {
          setState((current) => ({
            ...current,
            weekAppointments: snapshot.docs.map((appointmentDoc) => ({
              id: appointmentDoc.id,
              ...(appointmentDoc.data() as AppointmentDocument)
            }))
          }));
          setLoadingSections((current) => ({ ...current, weekAppointments: false }));
        },
        (snapshotError) => {
          console.error("Dashboard week appointments subscription failed", snapshotError);
          setError("Non siamo riusciti ad aggiornare la dashboard. Riprova tra poco.");
          setLoadingSections((current) => ({ ...current, weekAppointments: false }));
        }
      )
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user]);

  const isLoading = Object.values(loadingSections).some(Boolean);
  const todayRevenue = useMemo(
    () =>
      state.todayAppointments
        .filter((appointment) => appointment.status === "Completato")
        .reduce((total, appointment) => total + (appointment.price || 0), 0),
    [state.todayAppointments]
  );
  const weekRevenue = useMemo(
    () =>
      state.weekAppointments
        .filter((appointment) => appointment.status === "Completato")
        .reduce((total, appointment) => total + (appointment.price || 0), 0),
    [state.weekAppointments]
  );
  const topService = useMemo(() => {
    const counts = new Map<string, number>();
    state.weekAppointments.forEach((appointment) => {
      if (!appointment.serviceName) {
        return;
      }
      counts.set(appointment.serviceName, (counts.get(appointment.serviceName) || 0) + 1);
    });

    return Array.from(counts.entries()).sort((first, second) => second[1] - first[1])[0]?.[0] || "";
  }, [state.weekAppointments]);

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="relative overflow-hidden rounded-beauty-xl border border-beauty-border/70 bg-beauty-elevated/90 p-5 shadow-beauty-floating backdrop-blur sm:p-7">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-beauty-border/70 bg-beauty-surface/75 px-3 py-1.5 text-[12px] font-semibold text-beauty-muted shadow-beauty-soft">
              <Sparkles aria-hidden="true" className="size-4 text-beauty-primary" />
              Studio estetico
            </div>
            <div>
              {loadingSections.profile ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-full max-w-xl" />
                </div>
              ) : (
                <>
                  <p className="text-[15px] font-medium text-beauty-muted">{greeting}</p>
                  <h1 className="mt-1 text-[34px] font-bold leading-[1.05] tracking-normal text-beauty-text sm:text-[44px]">
                    {profileTitle}
                  </h1>
                </>
              )}
            </div>
            <p className="max-w-xl text-[15px] leading-6 text-beauty-muted">
              La dashboard mostra solo dati reali salvati su Firestore. Se una sezione e&apos; vuota, trovi il prossimo passo per attivarla.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/appointments">
              <PrimaryButton type="button">
                <CalendarPlus aria-hidden="true" className="size-5" />
                Nuovo appuntamento
              </PrimaryButton>
            </Link>
            <Link href="/profile">
              <SecondaryButton type="button">
                <Store aria-hidden="true" className="size-5" />
                Profilo
              </SecondaryButton>
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <Card className="border-beauty-danger/30 text-[14px] text-beauty-danger">{error}</Card>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </>
        ) : (
          <>
            <MetricCard
              icon={Clock3}
              label="Appuntamenti oggi"
              value={String(state.todayAppointments.length)}
              helper={state.todayAppointments.length ? "Dati letti dalla tua agenda" : "Nessun appuntamento programmato oggi"}
            />
            <MetricCard
              icon={Users}
              label="Clienti"
              value={String(state.clients.length)}
              helper={state.clients.length ? "Schede cliente salvate" : "Aggiungi il primo cliente"}
              tone="mint"
            />
            <MetricCard
              icon={Euro}
              label="Incasso oggi"
              value={formatCurrency(todayRevenue)}
              helper={todayRevenue ? "Solo appuntamenti completati" : "Nessun incasso completato oggi"}
              tone="gold"
            />
            <MetricCard
              icon={Gem}
              label="Incasso settimana"
              value={formatCurrency(weekRevenue)}
              helper={weekRevenue ? "Calcolato dagli appuntamenti completati" : "Nessun incasso settimanale"}
              tone="lavender"
            />
            <MetricCard
              icon={Scissors}
              label="Servizio top"
              value={topService || "-"}
              helper={topService ? "Basato sugli appuntamenti della settimana" : "Dati insufficienti"}
              tone="lavender"
            />
          </>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <section className="space-y-3">
            <SectionHeader title="Agenda di oggi" caption="Solo appuntamenti reali salvati in Firestore" />
            {loadingSections.todayAppointments ? (
              <Card>
                <Skeleton className="h-16" />
              </Card>
            ) : state.todayAppointments.length ? (
              <div className="space-y-2">
                {state.todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-3 rounded-beauty border border-beauty-border/60 bg-beauty-surface/70 p-3"
                  >
                    <div className="grid h-12 w-14 shrink-0 place-items-center rounded-beauty bg-beauty-primary/12 text-[13px] font-bold text-beauty-primary">
                      {formatAppointmentTime(appointment.date)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-beauty-text">
                        {appointment.clientNameSnapshot || "Cliente"}
                      </p>
                      <p className="truncate text-[12px] text-beauty-muted">{appointment.serviceName || "Servizio"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nessun appuntamento oggi"
                description="Quando programmerai appuntamenti reali, appariranno qui automaticamente."
              />
            )}
          </section>

          <section className="space-y-3">
            <SectionHeader title="Primi passi" caption="Checklist reale per rendere operativo lo studio" />
            <div className="grid gap-3 sm:grid-cols-2">
              {setupActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex min-h-24 w-full items-start gap-3 rounded-beauty-lg border border-beauty-border/70 bg-beauty-elevated/80 p-4 text-left shadow-beauty-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-beauty"
                >
                  <IconBadge icon={action.done ? CheckCircle2 : Sparkles} tone={action.done ? "mint" : "primary"} />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-beauty-text">{action.title}</span>
                    <span className="mt-1 block text-[12px] leading-5 text-beauty-muted">{action.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-start gap-3">
              <IconBadge icon={UserRound} tone="primary" />
              <div>
                <p className="text-[17px] font-bold text-beauty-text">Profilo studio</p>
                <p className="mt-1 text-[13px] leading-5 text-beauty-muted">
                  {profileComplete ? "Informazioni principali salvate." : "Completa il profilo per personalizzare la beta."}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-[14px] text-beauty-muted">
              <p>{state.profile?.ownerName ? `Titolare: ${state.profile.ownerName}` : "Titolare non inserito"}</p>
              <p>{state.profile?.phone ? `Telefono: ${state.profile.phone}` : "Telefono non inserito"}</p>
              <p>{state.profile?.email ? `Email: ${state.profile.email}` : "Email non inserita"}</p>
            </div>
          </Card>

          <Card className="space-y-4">
            <SectionHeader title="Prossimi appuntamenti" caption="Solo prenotazioni future reali" />
            {loadingSections.upcomingAppointments ? (
              <Skeleton className="h-20" />
            ) : state.upcomingAppointments.length ? (
              <div className="space-y-3">
                {state.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-beauty bg-beauty-card/80 p-3">
                    <p className="text-[14px] font-semibold text-beauty-text">
                      {appointment.clientNameSnapshot || "Cliente"}
                    </p>
                    <p className="mt-1 text-[12px] text-beauty-muted">
                      {formatAppointmentDay(appointment.date)} alle {formatAppointmentTime(appointment.date)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nessuna prenotazione futura"
                description="La lista si aggiornera' quando l'agenda sara' popolata con dati reali."
              />
            )}
          </Card>

          <Card className="space-y-3">
            <div className="flex items-start gap-3">
              <IconBadge icon={Scissors} tone="gold" />
              <div>
                <p className="text-[17px] font-bold text-beauty-text">Servizi</p>
                <p className="mt-1 text-[13px] leading-5 text-beauty-muted">
                  {state.services.length ? "Catalogo servizi collegato." : "Nessun servizio reale ancora presente."}
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
