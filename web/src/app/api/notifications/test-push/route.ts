import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth, adminDb, adminMessaging } from "@/lib/firebase/admin";

export const runtime = "nodejs";

function isAuthorized(decodedToken: DecodedIdToken) {
  return process.env.NODE_ENV === "development" || decodedToken.admin === true || decodedToken.novaAdmin === true;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

function logFcmError(context: string, error: unknown) {
  const firebaseLikeError = error as { code?: string; message?: string };
  console.error(context, {
    code: firebaseLikeError.code ?? "unknown",
    message: firebaseLikeError.message ?? "Errore sconosciuto"
  });
}

export async function POST(request: Request) {
  const idToken = getBearerToken(request);

  if (!idToken) {
    return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth().verifyIdToken(idToken);

    if (!isAuthorized(decodedToken)) {
      return NextResponse.json({ error: "Operazione non autorizzata." }, { status: 403 });
    }

    const userId = decodedToken.uid;
    const db = adminDb();
    const tokenSnapshot = await db
      .collection(`novabeautyUsers/${userId}/messagingTokens`)
      .orderBy("updatedAt", "desc")
      .limit(1)
      .get();

    if (tokenSnapshot.empty) {
      return NextResponse.json(
        { error: "Nessun dispositivo registrato per le notifiche push." },
        { status: 404 }
      );
    }

    const token = tokenSnapshot.docs[0].get("token") as string | undefined;

    if (!token) {
      return NextResponse.json({ error: "Token notifiche non disponibile." }, { status: 404 });
    }

    const title = "NovaBeauty";
    const description = "Le notifiche push sono configurate correttamente.";
    const action = "/notifications";

    await adminMessaging().send({
      token,
      notification: {
        title,
        body: description
      },
      data: {
        title,
        description,
        type: "system",
        priority: "normal",
        action
      },
      webpush: {
        fcmOptions: {
          link: action
        },
        notification: {
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png"
        }
      }
    });

    await db.collection(`novabeautyUsers/${userId}/notifications`).add({
      ownerId: userId,
      title,
      description,
      type: "system",
      priority: "normal",
      date: FieldValue.serverTimestamp(),
      read: false,
      action,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logFcmError("Test push failed", error);

    if (error instanceof Error && error.name === "FirebaseAdminConfigError") {
      return NextResponse.json(
        { error: "Firebase Admin non configurato per l'invio push server." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Non siamo riusciti a inviare la notifica di test." },
      { status: 500 }
    );
  }
}
