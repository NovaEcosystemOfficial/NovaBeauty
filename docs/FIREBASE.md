# Nova Ecosystem Firebase

## Scopo

Firebase NovaEcosystem e' infrastruttura condivisa tra tutte le applicazioni Nova.

Qualsiasi modifica a Firestore, Authentication, Storage o Rules deve preservare la compatibilita' con le app esistenti.

## Authentication

Firebase Authentication e' condiviso.

Ogni utente ha un solo account Auth e un solo documento Core:

```text
users/{uid}
```

Le app non devono creare identita' duplicate.

## Nova Core

Documento centrale:

```text
users/{uid}
```

Campi standard:

```ts
{
  email: string,
  displayName: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  apps: {
    novabeauty?: boolean,
    novapromo?: boolean,
    novadocs?: boolean,
    novajob?: boolean
  }
}
```

Regola:

- contiene solo identita' e abilitazioni app
- non contiene dati operativi di app specifiche
- deve restare compatibile con tutte le app Nova

## Namespace Dedicati

Ogni app usa un namespace separato:

```text
novabeautyUsers/{uid}
novapromoUsers/{uid}
novadocsUsers/{uid}
novajobUsers/{uid}
```

NovaBeauty:

```text
novabeautyUsers/{uid}
novabeautyUsers/{uid}/profile/main
novabeautyUsers/{uid}/settings/main
novabeautyUsers/{uid}/clients/{clientId}
novabeautyUsers/{uid}/appointments/{appointmentId}
novabeautyUsers/{uid}/services/{serviceId}
novabeautyUsers/{uid}/products/{productId}
novabeautyUsers/{uid}/notifications/{notificationId}
novabeautyUsers/{uid}/messagingTokens/{tokenId}
```

### Clienti NovaBeauty

Le schede clienti sono app-specifiche e restano nel namespace NovaBeauty:

```text
novabeautyUsers/{uid}/clients/{clientId}
```

Campi standard:

```ts
{
  ownerId: string,
  syncId: string,
  name: string,
  surname: string,
  phone: string,
  email: string,
  birthDate: string | null,
  notes: string | null,
  photoUrl: string | null,
  lastVisit: Timestamp | null,
  appointmentsCount: number,
  totalSpent: number,
  source: "manual" | "contacts" | "vcard",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

I duplicati vanno verificati lato app usando telefono normalizzato ed email.

#### Diario cliente

Ogni scheda cliente puo' avere voci cronologiche nel diario:

```text
novabeautyUsers/{uid}/clients/{clientId}/diario/{entryId}
```

Campi standard:

```ts
{
  ownerId: string,
  syncId: string,
  clientId: string,
  occurredAt: Timestamp,
  title: string,
  text: string,
  tags: ("PMU" | "Viso" | "Corpo" | "Unghie" | "Ciglia" | "Altro")[],
  appointmentId: string | null,
  serviceNameSnapshot: string | null,
  operatorNameSnapshot: string | null,
  photosBefore: {
    id: string,
    storagePath: string,
    downloadUrl: string,
    phase?: "before" | "after"
  }[],
  photosAfter: {
    id: string,
    storagePath: string,
    downloadUrl: string,
    phase?: "before" | "after"
  }[],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Le foto restano legate alla singola voce e sono salvate in Storage con separazione prima/dopo:

```text
apps/novabeauty/users/{uid}/clients/{clientId}/diario/{entryId}/before/{photoId}.jpg
apps/novabeauty/users/{uid}/clients/{clientId}/diario/{entryId}/after/{photoId}.jpg
```

Una voce puo' essere collegata a un appuntamento esistente per importare data, servizio e operatore.

### Agenda NovaBeauty

Gli appuntamenti sono salvati in:

```text
novabeautyUsers/{uid}/appointments/{appointmentId}
```

Campi standard:

```ts
{
  ownerId: string,
  syncId: string,
  date: Timestamp,
  clientId: string,
  clientNameSnapshot: string,
  serviceId: string | null,
  serviceName: string,
  price: number,
  startTime: string,
  endTime: string,
  durationMinutes: number,
  notes: string | null,
  status: "Prenotato" | "Confermato" | "Completato" | "Annullato",
  reminderMinutes: number,
  notificationIdentifier: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Ogni creazione appuntamento puo' generare una notifica interna in `notifications`.
Quando un appuntamento passa a `Completato`, l'app puo' aggiornare statistiche aggregate sulla scheda cliente.

### Servizi NovaBeauty

Il catalogo trattamenti e' salvato in:

```text
novabeautyUsers/{uid}/services/{serviceId}
```

Campi standard:

```ts
{
  ownerId: string,
  syncId: string,
  name: string,
  category: string,
  price: number | null,
  durationMinutes: number,
  description: string | null,
  active: boolean,
  source: "manual" | "template",
  templateId: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

I template NovaBeauty possono precompilare nome, categoria, durata e descrizione.
Il prezzo resta `null` finche' non viene impostato dallo studio.

### Notifiche NovaBeauty

Il Centro Notifiche usa dati app-specifici:

```text
novabeautyUsers/{uid}/notifications/{notificationId}
```

Campi standard:

```ts
{
  ownerId: string,
  title: string,
  description: string,
  type: "appointment" | "client" | "finance" | "system" | "promotion",
  priority: "low" | "normal" | "high",
  date: Timestamp,
  read: boolean,
  action: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

I token Firebase Cloud Messaging sono salvati in:

```text
novabeautyUsers/{uid}/messagingTokens/{tokenId}
```

Le notifiche automatiche server-side future dovranno leggere questi token senza spostarli in `users/{uid}`.

### Invio Push FCM

L'invio push reale deve avvenire solo lato server con Firebase Admin SDK.

NovaBeauty espone un endpoint protetto per test manuale:

```text
POST /api/notifications/test-push
```

Requisiti:

- Authorization header con Firebase ID token dell'utente autenticato
- ambiente development oppure custom claim `admin=true` o `novaAdmin=true`
- token FCM gia' salvato in `novabeautyUsers/{uid}/messagingTokens`
- variabili server `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`

L'endpoint non deve loggare token FCM, private key o ID token.

## Firestore Rules

Principio base:

```text
request.auth != null && request.auth.uid == uid
```

Regole attuali:

```text
users/{uid}
novabeautyUsers/{uid}/{document=**}
```

Le rules devono essere additive e conservative.

Non rimuovere accessi esistenti senza:

- audit
- migrazione
- test
- aggiornamento documentazione

## Storage

Storage deve seguire lo stesso principio dei namespace.

Pattern consigliato:

```text
apps/{appId}/users/{uid}/...
```

Per NovaBeauty:

```text
apps/novabeauty/users/{uid}/profile/profile.jpg
```

Se codice legacy usa path precedenti, introdurre migrazioni non distruttive.

## Migrazioni Future

Ogni migrazione deve:

1. essere documentata
2. avere piano rollback
3. mantenere lettura legacy se necessario
4. evitare cancellazioni immediate
5. essere testata con dry-run dove possibile

## Checklist Prima Di Cambiare Firebase

- Ho letto `ARCHITECTURE.md`, `FIREBASE.md`, `ENVIRONMENT.md`, `SECURITY.md`.
- La modifica e' compatibile con `users/{uid}`.
- La modifica usa namespace app-specifico.
- Le rules sono minime e conservative.
- Esiste una migrazione se cambiano dati esistenti.
- La documentazione e' aggiornata.
