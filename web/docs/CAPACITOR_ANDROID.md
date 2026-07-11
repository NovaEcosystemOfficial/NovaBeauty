# NovaBeauty Android (Capacitor)

## Strategia

NovaBeauty Android usa **Capacitor con URL remoto Vercel** (strategia B/C ibrida):

- la PWA su Vercel resta invariata;
- l'app Android è un guscio nativo che carica la stessa web app pubblicata;
- `CAPACITOR_SERVER_URL` punta al dominio di produzione Vercel;
- `webDir: public` serve solo come asset locale minimo per `cap sync`.

Questa scelta evita di convertire Next.js in export statico e preserva:

- route dinamiche `clients/[clientId]/...`;
- API `POST /api/notifications/test-push`;
- route `GET /firebase-messaging-sw-config.json`;
- deploy PWA esistente con Workbox.

## Setup locale

```bash
cd web
cp .env.capacitor.example .env.capacitor.local
# imposta CAPACITOR_SERVER_URL con il dominio Vercel di produzione

export CAPACITOR_SERVER_URL="https://<dominio-produzione>.vercel.app"
npm install
npm run build
npm run cap:sync
npm run cap:open:android
```

## Build debug

```bash
cd web
npm run android:assemble:debug
```

APK debug:

```text
web/android/app/build/outputs/apk/debug/app-debug.apk
```

## Firebase Android

Non committare `google-services.json` finché non viene generato da Firebase Console.

1. Apri Firebase Console sul progetto NovaEcosystem (`beauty-souls-app` / `NEXT_PUBLIC_FIREBASE_PROJECT_ID`).
2. Aggiungi app **Android** con package `com.novaecosystem.novabeauty`.
3. Scarica `google-services.json`.
4. Copia in `web/android/app/google-services.json`.
5. Esegui `npm run cap:sync` e ricompila.

Gradle è già predisposto:

- classpath `com.google.gms:google-services` in `android/build.gradle`;
- apply condizionale in `android/app/build.gradle` se il file esiste.

## Notifiche

Fase attuale: **nessuna implementazione FCM Android nativa**.

- Web Push PWA usa service worker + VAPID;
- in WebView Android il push web è inaffidabile;
- fase successiva: `@capacitor-firebase/messaging` o FCM nativo + salvataggio token in `novabeautyUsers/{uid}/messagingTokens`.

## Permessi Android

Attualmente dichiarato:

- `INTERNET`

Aggiunti automaticamente dai plugin installati quando usati:

- `@capacitor/camera` → fotocamera / galleria

## Plugin Capacitor installati

- `@capacitor/app` — tasto indietro
- `@capacitor/status-bar` — colori status bar
- `@capacitor/splash-screen` — splash nativo
- `@capacitor/browser` — link esterni (da integrare nei fornitori)
- `@capacitor/camera` — fotocamera nativa (fase successiva diario)
