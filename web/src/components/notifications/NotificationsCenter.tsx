"use client";

import Link from "next/link";
import {
  Bell,
  Calendar,
  Check,
  Megaphone,
  MonitorCog,
  Send,
  PiggyBank,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { getIdTokenResult } from "firebase/auth";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { IconBadge } from "@/components/ui/IconBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { hasFirebaseVapidKey, requestNotificationPermissionAndSaveToken } from "@/lib/firebase/messaging";
import { notificationsPath } from "@/lib/firebase/paths";
import { markNotificationAsRead } from "@/lib/notifications/notifications";
import type { NotificationCategory, NotificationDocument } from "@/types/firestore";

type NotificationItem = NotificationDocument & {
  id: string;
};

const categoryIcons = {
  appointment: Calendar,
  client: UserRound,
  finance: PiggyBank,
  system: MonitorCog,
  promotion: Megaphone
};

const categoryLabels: Record<NotificationCategory, string> = {
  appointment: "Appuntamenti",
  client: "Clienti",
  finance: "Finanza",
  system: "Sistema",
  promotion: "Promozioni"
};

function formatDate(notification: NotificationItem) {
  const source = notification.date ?? notification.createdAt;

  if (!source?.toDate) {
    return "";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(source.toDate());
}

export function NotificationsCenter() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [isSendingTestPush, setIsSendingTestPush] = useState(false);
  const [canSendTestPush, setCanSendTestPush] = useState(process.env.NODE_ENV === "development");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const notificationsQuery = query(
      collection(db, notificationsPath(user.uid)),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        setNotifications(
          snapshot.docs.map((notificationDoc) => ({
            id: notificationDoc.id,
            ...(notificationDoc.data() as NotificationDocument)
          }))
        );
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Notifications subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare le notifiche. Riprova tra poco.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCanSendTestPush(process.env.NODE_ENV === "development");
      return;
    }

    getIdTokenResult(user)
      .then((tokenResult) => {
        setCanSendTestPush(
          process.env.NODE_ENV === "development" ||
            tokenResult.claims.admin === true ||
            tokenResult.claims.novaAdmin === true
        );
      })
      .catch((claimsError) => {
        console.error("Admin claim check failed", {
          message: claimsError instanceof Error ? claimsError.message : "Errore sconosciuto"
        });
        setCanSendTestPush(process.env.NODE_ENV === "development");
      });
  }, [user]);

  async function handleEnablePush() {
    if (!user) {
      return;
    }

    setIsEnablingPush(true);
    setError("");
    setSuccess("");

    try {
      await requestNotificationPermissionAndSaveToken(user.uid);
      setSuccess("Notifiche push abilitate su questo dispositivo.");
      showToast("Notifiche push abilitate.");
    } catch (pushError) {
      console.error("Push enable failed", pushError);
      setError(
        hasFirebaseVapidKey()
          ? "Non siamo riusciti ad abilitare le notifiche su questo dispositivo."
          : "Configura NEXT_PUBLIC_FIREBASE_VAPID_KEY per abilitare le notifiche push."
      );
      showToast("Notifiche push non abilitate.", "error");
    } finally {
      setIsEnablingPush(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    if (!user) {
      return;
    }

    try {
      await markNotificationAsRead(user.uid, notificationId);
    } catch (readError) {
      console.error("Mark notification as read failed", readError);
      showToast("Non siamo riusciti ad aggiornare la notifica.", "error");
    }
  }

  async function handleSendTestPush() {
    if (!user) {
      return;
    }

    setIsSendingTestPush(true);
    setError("");
    setSuccess("");

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/notifications/test-push", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Invio non riuscito.");
      }

      setSuccess("Notifica di test inviata.");
      showToast("Notifica di test inviata.");
    } catch (sendError) {
      console.error("Test push request failed", {
        message: sendError instanceof Error ? sendError.message : "Errore sconosciuto"
      });
      setError(sendError instanceof Error ? sendError.message : "Non siamo riusciti a inviare la notifica di test.");
      showToast("Notifica di test non inviata.", "error");
    } finally {
      setIsSendingTestPush(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <IconBadge icon={Bell} tone="primary" />
            <div>
              <h2 className="text-[20px] font-semibold">Centro notifiche</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">
                Eventi importanti, promemoria e messaggi di sistema in un unico spazio.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <PrimaryButton type="button" onClick={handleEnablePush} disabled={isEnablingPush}>
              <ShieldCheck className="size-5" aria-hidden="true" />
              {isEnablingPush ? "Attivazione..." : "Abilita push"}
            </PrimaryButton>
            {canSendTestPush ? (
              <SecondaryButton type="button" onClick={handleSendTestPush} disabled={isSendingTestPush}>
                <Send className="size-5" aria-hidden="true" />
                {isSendingTestPush ? "Invio..." : "Invia notifica di test"}
              </SecondaryButton>
            ) : null}
          </div>
        </div>
        {error ? <ErrorMessage message={error} /> : null}
        {success ? <SuccessMessage message={success} /> : null}
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = categoryIcons[notification.type] ?? MonitorCog;

            return (
              <Card
                key={notification.id}
                className={notification.read ? "opacity-75" : "border-beauty-primary/35 bg-beauty-elevated"}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <IconBadge icon={Icon} tone={notification.priority === "high" ? "gold" : "primary"} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[16px] font-bold text-beauty-text">{notification.title}</p>
                        {!notification.read ? (
                          <span className="rounded-full bg-beauty-danger px-2 py-0.5 text-[11px] font-bold text-white">
                            Nuova
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[14px] leading-5 text-beauty-muted">{notification.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-beauty-subtle">
                        <span>{categoryLabels[notification.type]}</span>
                        <span>{notification.priority}</span>
                        {formatDate(notification) ? <span>{formatDate(notification)}</span> : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {notification.action ? (
                      <Link href={notification.action}>
                        <SecondaryButton type="button" className="h-10">
                          Apri
                        </SecondaryButton>
                      </Link>
                    ) : null}
                    {!notification.read ? (
                      <SecondaryButton type="button" className="h-10 px-3" onClick={() => handleMarkAsRead(notification.id)}>
                        <Check className="size-4" aria-hidden="true" />
                        Letta
                      </SecondaryButton>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Nessuna notifica"
          description="Quando NovaBeauty registrera' eventi reali, li troverai qui."
        />
      )}
    </div>
  );
}
