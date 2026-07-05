# Nova Ecosystem Environment Standard

## Principio

Firebase NovaEcosystem e' un'infrastruttura condivisa da tutte le applicazioni Nova.

Ogni applicazione deve dichiarare in modo esplicito le variabili ambiente richieste, senza valori committati nel repository.

## Struttura standard

Ogni applicazione web Nova deve avere nella propria root applicativa:

```text
.env.example
.env.local
```

Nel caso di NovaBeauty la root applicativa e':

```text
web/
```

`.env.example` deve contenere solo i nomi delle variabili:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

`.env.local` contiene i valori locali reali e non deve mai essere committato.

## Variabili Firebase web

Queste variabili configurano il Firebase Web SDK:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` opzionale per abilitare Firebase Cloud Messaging web push

Variabili server-side per inviare push reali tramite Firebase Admin SDK:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

Il prefisso `NEXT_PUBLIC_` e' necessario per rendere la configurazione disponibile al client Next.js.
Le variabili `FIREBASE_ADMIN_*` non devono avere prefisso `NEXT_PUBLIC_` e non devono mai essere esposte al browser.

## Firebase Cloud Messaging

Le app Nova che usano notifiche push web devono aggiungere:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

La chiave VAPID si genera da Firebase Console, sezione Cloud Messaging.

Per NovaBeauty questa variabile abilita:

- richiesta permesso notifiche
- generazione token FCM web
- salvataggio token in `novabeautyUsers/{uid}/messagingTokens/{tokenId}`
- notifiche foreground e background

Se la variabile non e' configurata, la PWA resta funzionante ma le notifiche push non vengono abilitate.

Per inviare notifiche push reali dal server, NovaBeauty usa Firebase Admin SDK con:

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

`FIREBASE_ADMIN_PRIVATE_KEY` deve essere configurata su Vercel conservando i newline come `\n` oppure come valore multilinea supportato dal provider.
Queste variabili servono all'endpoint server `/api/notifications/test-push` e non vengono validate da `env:check` per non bloccare ambienti che non inviano push server-side.

## Configurare un nuovo progetto Nova

1. Creare la cartella dell'app, per esempio `web/`.
2. Creare `.env.example` con tutte le variabili richieste, senza valori.
3. Creare `.env.local` copiando `.env.example` e inserendo i valori locali.
4. Aggiungere uno script `env:check` che valida le variabili richieste.
5. Eseguire `env:check` prima della build.
6. Documentare ogni nuova variabile in questo file o nella documentazione dell'app.

## Collegare Firebase

1. Aprire Firebase Console.
2. Selezionare il progetto NovaEcosystem.
3. Creare o selezionare la Web App dell'app Nova.
4. Copiare la configurazione Firebase Web.
5. Inserire i valori in `.env.local`.
6. Inserire gli stessi valori nelle Environment Variables del provider di deploy.

## Collegare Vercel

Per NovaBeauty:

- Root Directory: `web`
- Framework Preset: `Next.js`
- Install Command: `npm ci`
- Build Command: `npm run build`

Configurare su Vercel le stesse variabili presenti in `.env.example`.

Non committare mai `.env.local`.

## Controllo automatico

NovaBeauty esegue:

```text
npm run env:check
```

Il controllo viene eseguito automaticamente anche prima di:

```text
npm run build
```

Se manca una variabile richiesta, la build viene bloccata con:

- nome della variabile mancante
- file in cui viene usata
- istruzione per aggiornare `.env.local` e Vercel

## Checklist pre-deploy

- `.env.example` contiene solo nomi, senza valori.
- `.env.local` esiste localmente ed e' ignorato da Git.
- Tutte le variabili Vercel richieste sono presenti.
- `npm run env:check` passa.
- `npm run lint` passa.
- `npm run build` passa.
- Le Firestore Rules sono compatibili con Nova Core e con i namespace app-specifici.
- Ogni nuova variabile e' documentata.
