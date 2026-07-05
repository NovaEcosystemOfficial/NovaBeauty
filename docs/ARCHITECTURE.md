# Nova Ecosystem Architecture

## Scopo

Nova Ecosystem e' una piattaforma composta da applicazioni verticali che condividono infrastruttura, identita', standard tecnici e principi di sicurezza.

NovaBeauty e' una delle applicazioni dell'ecosistema, non un progetto isolato.

Applicazioni previste:

- NovaBeauty
- NovaPromo
- NovaDocs
- NovaJob
- NovaMobile
- future app Nova

## Principi Fondamentali

1. Firebase e' condiviso.
2. `users/{uid}` e' l'identita' centrale dell'ecosistema.
3. Ogni applicazione usa namespace Firestore separati.
4. Nessuna modifica infrastrutturale deve rompere applicazioni esistenti.
5. Ogni nuova funzionalita' deve essere riutilizzabile da altre app quando possibile.
6. Ogni modifica a Firebase, Firestore Rules, Environment, Deploy o Architettura deve essere documentata.

## Livelli Architetturali

### Nova Core

Nova Core contiene cio' che vale per tutto l'ecosistema:

- identita' utente
- autenticazione condivisa
- membership app
- standard environment
- regole di sicurezza comuni
- convenzioni di deploy
- documentazione infrastrutturale

Firestore:

```text
users/{uid}
```

### App Namespace

Ogni app usa un namespace dedicato:

```text
novabeautyUsers/{uid}
novapromoUsers/{uid}
novadocsUsers/{uid}
novajobUsers/{uid}
```

Questo evita collisioni tra dati, rules, query e migrazioni.

### Frontend

Ogni applicazione web Nova puo' avere una root applicativa separata, per esempio:

```text
web/
```

NovaBeauty usa Next.js App Router dentro `web/`.

### Backend-as-a-Service

Firebase fornisce:

- Authentication
- Firestore
- Storage
- Rules
- Hosting opzionale per progetti non Vercel

Vercel fornisce deploy e hosting web per la PWA.

## Compatibilita'

Le app esistenti devono continuare a funzionare durante ogni evoluzione.

Prima di modificare infrastruttura condivisa bisogna controllare:

- `ARCHITECTURE.md`
- `FIREBASE.md`
- `ENVIRONMENT.md`
- `SECURITY.md`

## Controllo Di Impatto

Prima di modifiche infrastrutturali bisogna dichiarare:

- cosa verra' modificato
- quali progetti potrebbero essere coinvolti
- rischi di incompatibilita'
- migrazioni necessarie

## Estensione Con Nuove App

Una nuova app Nova deve:

1. usare Firebase NovaEcosystem
2. usare `users/{uid}` solo per identita' condivisa
3. creare un namespace dedicato
4. aggiungere rules conservative
5. usare `.env.example` e `env:check`
6. documentare variabili, deploy e dati
7. non modificare strutture esistenti senza migrazione
