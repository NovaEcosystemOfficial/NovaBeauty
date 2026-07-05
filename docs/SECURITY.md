# Nova Ecosystem Security

## Principi

La sicurezza del Nova Ecosystem si basa su:

- autenticazione Firebase
- namespace isolati per app
- Firestore Rules conservative
- nessun segreto nel repository
- deploy controllati
- documentazione obbligatoria per modifiche infrastrutturali

## Authentication

Firebase Authentication e' condiviso.

Regole:

- ogni utente usa un solo `uid`
- le app non devono creare identita' parallele
- ogni dato operativo deve essere legato a `request.auth.uid`

## Firestore Rules

Regola base:

```text
request.auth != null && request.auth.uid == uid
```

I dati Core:

```text
users/{uid}
```

I dati app-specifici:

```text
{appNamespace}/{uid}/{document=**}
```

Le rules devono essere:

- minime
- leggibili
- additive
- compatibili con app esistenti
- validate in dry-run prima del deploy

## Permessi

Un utente puo' leggere e scrivere solo i propri dati.

Accessi admin, team o multi-tenant dovranno essere progettati separatamente e documentati prima dell'implementazione.

## Environment

Non committare:

- `.env.local`
- token
- service account
- API secret
- file `.vercel`

Le variabili pubbliche Firebase Web usano `NEXT_PUBLIC_`, ma devono comunque essere gestite via standard `ENVIRONMENT.md`.

## Storage

Storage deve seguire namespace app-specifici.

Pattern consigliato:

```text
apps/{appId}/users/{uid}/...
```

Le regole Storage devono verificare `request.auth.uid`.

## Best Practice

- Non usare wildcard aperte senza controllo uid.
- Non usare `allow read, write: if true`.
- Non salvare dati di app in `users/{uid}`.
- Non cancellare namespace legacy senza migrazione.
- Non deployare rules senza dry-run.
- Non introdurre env senza documentazione.

## Controllo Prima Di Modifiche Infrastrutturali

Prima di modificare Firebase, Rules, Environment, Deploy o Architettura bisogna indicare:

- cosa verra' modificato
- progetti coinvolti
- rischi di incompatibilita'
- migrazioni necessarie
