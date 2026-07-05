import { NextResponse } from "next/server";
import { createSign } from "node:crypto";

export const runtime = "nodejs";

type GoogleAccessTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type AccountLookupResponse = {
  users?: Array<{
    localId?: string;
    customAttributes?: string;
  }>;
};

type FirestoreRunQueryResponse = Array<{
  document?: {
    fields?: {
      token?: {
        stringValue?: string;
      };
    };
  };
}>;

function isAuthorized(customAttributes: string | undefined) {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  if (!customAttributes) {
    return false;
  }

  try {
    const claims = JSON.parse(customAttributes) as { admin?: unknown; novaAdmin?: unknown };
    return claims.admin === true || claims.novaAdmin === true;
  } catch {
    return false;
  }
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

function getServerFirebaseConfig() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!projectId || !clientEmail || !privateKey || !apiKey) {
    const error = new Error("Firebase Admin non configurato.");
    error.name = "FirebaseAdminConfigError";
    throw error;
  }

  return { projectId, clientEmail, privateKey, apiKey };
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    })
  );
  const unsignedJwt = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(unsignedJwt).sign(privateKey);
  const assertion = `${unsignedJwt}.${base64Url(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const data = (await response.json()) as GoogleAccessTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? "Access token Google non disponibile.");
  }

  return data.access_token;
}

async function verifyFirebaseIdToken(idToken: string, apiKey: string) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ idToken })
  });
  const data = (await response.json()) as AccountLookupResponse;
  const user = data.users?.[0];

  if (!response.ok || !user?.localId) {
    return null;
  }

  return user;
}

async function getLatestMessagingToken(projectId: string, accessToken: string, userId: string) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/novabeautyUsers/${userId}:runQuery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "messagingTokens" }],
          orderBy: [{ field: { fieldPath: "updatedAt" }, direction: "DESCENDING" }],
          limit: 1
        }
      })
    }
  );
  const data = (await response.json()) as FirestoreRunQueryResponse;

  if (!response.ok) {
    throw new Error("Lettura token notifiche non riuscita.");
  }

  return data.find((entry) => entry.document?.fields?.token?.stringValue)?.document?.fields?.token?.stringValue ?? null;
}

async function createNotificationDocument(
  projectId: string,
  accessToken: string,
  userId: string,
  title: string,
  description: string,
  action: string
) {
  const now = new Date().toISOString();

  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/novabeautyUsers/${userId}/notifications`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          ownerId: { stringValue: userId },
          title: { stringValue: title },
          description: { stringValue: description },
          type: { stringValue: "system" },
          priority: { stringValue: "normal" },
          date: { timestampValue: now },
          read: { booleanValue: false },
          action: { stringValue: action },
          createdAt: { timestampValue: now },
          updatedAt: { timestampValue: now }
        }
      })
    }
  );
}

async function sendFcmMessage(projectId: string, accessToken: string, token: string, title: string, description: string, action: string) {
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: {
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
          fcm_options: {
            link: action
          },
          notification: {
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png"
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error("Invio FCM non riuscito.");
  }
}

export async function POST(request: Request) {
  const idToken = getBearerToken(request);

  if (!idToken) {
    return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
  }

  try {
    const { projectId, clientEmail, privateKey, apiKey } = getServerFirebaseConfig();
    const user = await verifyFirebaseIdToken(idToken, apiKey);

    if (!user) {
      return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
    }

    if (!isAuthorized(user.customAttributes)) {
      return NextResponse.json({ error: "Operazione non autorizzata." }, { status: 403 });
    }

    const userId = user.localId;

    if (!userId) {
      return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
    }

    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
    const token = await getLatestMessagingToken(projectId, accessToken, userId);

    if (!token) {
      return NextResponse.json(
        { error: "Nessun dispositivo registrato per le notifiche push." },
        { status: 404 }
      );
    }

    const title = "NovaBeauty";
    const description = "Le notifiche push sono configurate correttamente.";
    const action = "/notifications";

    await sendFcmMessage(projectId, accessToken, token, title, description, action);
    await createNotificationDocument(projectId, accessToken, userId, title, description, action);

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
