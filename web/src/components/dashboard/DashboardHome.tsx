"use client";

import Link from "next/link";
import {
  Bell,
  CalendarPlus,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Euro,
  FileUp,
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
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/client";
import { appointmentsPath, clientsPath, profilePath, servicesPath } from "@/lib/firebase/paths";
import { routes } from "@/lib/constants/routes";
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
        href: routes.studioMioStudio,
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

  const nextAppointment = state.upcomingAppointments[0];
  const pendingSetupCount = setupActions.filter((action) => !action.done).length;
  const quickActions = [
    {
      label: "Appuntamento",
      href: "/appointments",
      icon: CalendarPlus,
      tone: "primary" as const
    },
    {
      label: "Cliente",
      href: "/clients",
      icon: Users,
      tone: "mint" as const
    },
    {
      label: "vCard",
      href: "/clients",
      icon: FileUp,
      tone: "gold" as const
    },
    {
      label: "Il mio studio",
      href: routes.studioMioStudio,
      icon: Store,
      tone: "lavender" as const
    }
  ];
  const appMetrics = [
    {
      label: "Oggi",
      value: String(state.todayAppointments.length),
      helper: state.todayAppointments.length ? "appuntamenti" : "agenda libera",
      icon: Clock3,
      tone: "primary" as const
    },
    {
      label: "Clienti",
      value: String(state.clients.length),
      helper: state.clients.length ? "schede salvate" : "da aggiungere",
      icon: Users,
      tone: "mint" as const
    },
    {
      label: "Incasso",
      value: formatCurrency(todayRevenue),
      helper: "oggi",
      icon: Euro,
      tone: "gold" as const
    },
    {
      label: "Settimana",
      value: formatCurrency(weekRevenue),
      helper: topService || "nessun servizio top",
      icon: Gem,
      tone: "lavender" as const
    }
  ];

  return (
    <div className="mx-auto max-w-[430px] space-y-5 pb-4 animate-fade-up lg:max-w-6xl lg:space-y-7">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-beauty-primary text-[18px] font-black text-white shadow-beauty">
            N
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-beauty-muted">NovaBeauty</p>
            {loadingSections.profile ? (
              <Skeleton className="mt-2 h-5 w-40" />
            ) : (
              <h1 className="truncate text-[22px] font-bold leading-tight text-beauty-text">{profileTitle}</h1>
            )}
          </div>
        </div>
        <Link
          href="/notifications"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-beauty-border/80 bg-beauty-elevated shadow-beauty-soft transition active:scale-95"
          aria-label="Apri notifiche"
        >
          <Bell aria-hidden="true" className="size-5 text-beauty-text" />
        </Link>
      </header>

      {error ? (
        <Card className="border-beauty-danger/30 text-[14px] text-beauty-danger">{error}</Card>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-beauty-border/70 bg-beauty-elevated/95 p-5 shadow-beauty-floating backdrop-blur lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:gap-6 lg:p-7">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-beauty-muted">{greeting}</p>
              <h2 className="mt-2 text-[34px] font-black leading-none text-beauty-text sm:text-[42px]">Oggi</h2>
            </div>
            <div className="rounded-full bg-beauty-primary/12 px-3 py-1.5 text-[12px] font-bold text-beauty-primary">
              {pendingSetupCount ? `${pendingSetupCount} step` : "Pronta"}
            </div>
          </div>

          {loadingSections.todayAppointments ? (
            <Skeleton className="h-28" />
          ) : nextAppointment ? (
            <Link
              href="/appointments"
              className="group flex items-center gap-4 rounded-[24px] bg-beauty-card/85 p-4 transition active:scale-[0.99] lg:max-w-xl"
            >
              <div className="grid size-16 shrink-0 place-items-center rounded-[22px] bg-beauty-primary text-[16px] font-black text-white shadow-beauty">
                {formatAppointmentTime(nextAppointment.date)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-bold text-beauty-text">
                  {nextAppointment.clientNameSnapshot || "Cliente"}
                </p>
                <p className="mt-1 truncate text-[13px] text-beauty-muted">
                  {formatAppointmentDay(nextAppointment.date)} - {nextAppointment.serviceName || "Servizio"}
                </p>
              </div>
              <ChevronRight aria-hidden="true" className="size-5 text-beauty-muted transition group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <div className="rounded-[24px] bg-beauty-card/85 p-4">
              <p className="text-[17px] font-bold text-beauty-text">Nessun appuntamento in agenda</p>
              <p className="mt-1 text-[13px] leading-5 text-beauty-muted">Crea il primo appuntamento quando lo studio e pronto.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 lg:max-w-xl">
            <div className="rounded-[22px] bg-beauty-primary/10 p-4">
              <p className="text-[12px] font-semibold text-beauty-muted">Incasso oggi</p>
              <p className="mt-2 text-[24px] font-black leading-none text-beauty-text">{formatCurrency(todayRevenue)}</p>
            </div>
            <div className="rounded-[22px] bg-beauty-mint/10 p-4">
              <p className="text-[12px] font-semibold text-beauty-muted">Clienti</p>
              <p className="mt-2 text-[24px] font-black leading-none text-beauty-text">{state.clients.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:mt-0">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center justify-between rounded-[22px] border border-beauty-border/60 bg-beauty-surface/70 p-3 shadow-beauty-soft transition hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <IconBadge icon={action.icon} tone={action.tone} />
                <span className="truncate text-[15px] font-bold text-beauty-text">{action.label}</span>
              </span>
              <ChevronRight aria-hidden="true" className="size-5 text-beauty-muted" />
            </Link>
          ))}
        </div>
      </section>

      <section className="-mx-beauty-page overflow-x-auto px-beauty-page pb-1 sm:mx-0 sm:px-0">
        <div className="flex snap-x gap-3 lg:grid lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28 min-w-[160px] snap-start rounded-[24px] lg:min-w-0" />
            <Skeleton className="h-28 min-w-[160px] snap-start rounded-[24px] lg:min-w-0" />
            <Skeleton className="h-28 min-w-[160px] snap-start rounded-[24px] lg:min-w-0" />
            <Skeleton className="h-28 min-w-[160px] snap-start rounded-[24px] lg:min-w-0" />
          </>
        ) : (
          appMetrics.map((metric) => (
            <article
              key={metric.label}
              className="min-w-[160px] snap-start rounded-[24px] border border-beauty-border/70 bg-beauty-elevated/90 p-4 shadow-beauty-soft backdrop-blur lg:min-w-0"
            >
              <IconBadge icon={metric.icon} tone={metric.tone} />
              <p className="mt-4 text-[12px] font-semibold text-beauty-muted">{metric.label}</p>
              <p className="mt-1 truncate text-[24px] font-black leading-none text-beauty-text">{metric.value}</p>
              <p className="mt-2 truncate text-[12px] text-beauty-subtle">{metric.helper}</p>
            </article>
          ))
        )}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-7">
        <div className="space-y-5 lg:space-y-7">
          <section className="space-y-3">
            <SectionHeader title="Agenda" caption="Oggi" />
            {loadingSections.todayAppointments ? (
              <Card className="rounded-[24px]">
                <Skeleton className="h-16" />
              </Card>
            ) : state.todayAppointments.length ? (
              <div className="space-y-2">
                {state.todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-3 rounded-[24px] border border-beauty-border/60 bg-beauty-surface/70 p-3 shadow-beauty-soft"
                  >
                    <div className="grid h-12 w-14 shrink-0 place-items-center rounded-[18px] bg-beauty-primary/12 text-[13px] font-bold text-beauty-primary">
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
                description="Quando programmerai appuntamenti reali, appariranno qui."
              />
            )}
          </section>

          <section className="space-y-3">
            <SectionHeader title="Primi passi" caption={pendingSetupCount ? `${pendingSetupCount} azioni aperte` : "Setup completo"} />
            <div className="-mx-beauty-page flex snap-x gap-3 overflow-x-auto px-beauty-page pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">
              {setupActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex min-h-28 min-w-[250px] snap-start items-start gap-3 rounded-[24px] border border-beauty-border/70 bg-beauty-elevated/80 p-4 text-left shadow-beauty-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-beauty sm:min-w-0"
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

        <aside className="space-y-5 lg:space-y-7">
          <Card className="space-y-4 rounded-[24px]">
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

          <Card className="space-y-4 rounded-[24px]">
            <SectionHeader title="Prossimi" caption="Prenotazioni future" />
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
                description="La lista si aggiornera quando l'agenda sara popolata con dati reali."
              />
            )}
          </Card>

          <Card className="space-y-3 rounded-[24px]">
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
