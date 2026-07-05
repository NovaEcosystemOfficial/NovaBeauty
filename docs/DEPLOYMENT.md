# Nova Ecosystem Deployment

## Scopo

Questo documento definisce lo standard deploy per le applicazioni Nova.

NovaBeauty usa GitHub, Vercel e Firebase NovaEcosystem.

## GitHub

Repository:

```text
NovaEcosystemOfficial/NovaBeauty
```

Branch principale:

```text
main
```

Regole:

- committare solo codice e configurazione non segreta
- non committare `.env.local`
- validare build prima del push quando si tocca infrastruttura
- mantenere documentazione aggiornata

## Vercel

NovaBeauty e' una app Next.js dentro:

```text
web/
```

Configurazione:

```text
Root Directory: web
Framework: Next.js
Install Command: npm ci
Build Command: npm run build
```

La configurazione locale Vercel non deve essere committata:

```text
.vercel/
```

## Variabili Ambiente

Lo standard ufficiale e':

```text
docs/ENVIRONMENT.md
```

Le variabili richieste per NovaBeauty sono:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Vercel deve avere le stesse variabili configurate per Production e Preview quando necessario.

## Build Guard

NovaBeauty esegue `env:check` prima della build.

Se manca una variabile, il deploy deve fallire con un messaggio chiaro.

## Firebase Deploy

Firestore Rules devono essere validate prima del deploy:

```text
firebase deploy --only firestore:rules --dry-run
```

Deploy reale solo dopo conferma:

```text
firebase deploy --only firestore:rules
```

## Rollback

Vercel:

- usare la dashboard Vercel per promuovere un deployment precedente
- verificare che le env siano compatibili con quel deployment

Firebase:

- mantenere storico delle rules
- evitare migrazioni distruttive
- documentare ogni deploy rules in `CHANGELOG.md`

## Checklist Pre Deploy

- `npm run env:check` passa.
- `npm run lint` passa.
- `npm run build` passa.
- Vercel env configurate.
- Firestore Rules validate in dry-run se modificate.
- Documentazione aggiornata.
- Nessuna modifica rompe namespace esistenti.
- Piano rollback noto per modifiche infrastrutturali.
