# Firestore Structure

## Principio principale

Ogni record deve appartenere all'utente autenticato.

La struttura definitiva separa Nova Core dai dati specifici NovaBeauty.

Nova Core usa:

```text
users/{userId}
```

NovaBeauty usa:

```text
novabeautyUsers/{userId}/{document=**}
```

Regola base:

```text
request.auth != null && request.auth.uid == userId
```

## Struttura generale

```text
users/{userId}
  apps.novabeauty = true

novabeautyUsers/{userId}
  profile/main
  clients/{clientId}
  services/{serviceId}
  appointments/{appointmentId}
  products/{productId}
  settings/main
```

Nota: il magazzino esiste in Beauty Souls, ma non e' nel flusso prioritario NovaBeauty richiesto. Se verra' mantenuto in futuro, usare:

```text
novabeautyUsers/{userId}/products/{productId}
```

## users

Documento:

```text
users/{userId}
```

Campi:

```ts
{
  email: string,
  displayName: string,
  apps: {
    novabeauty: true
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Uso:

- Documento radice utente Nova Core.
- Non contiene dati operativi pesanti.
- Tiene traccia delle app Nova abilitate per l'utente.

## novabeautyUsers

Documento:

```text
novabeautyUsers/{userId}
```

Campi:

```ts
{
  ownerId: string,
  email: string,
  displayName: string,
  onboardingCompleted: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Uso:

- Documento radice dello spazio NovaBeauty.
- Tutti i dati operativi NovaBeauty vivono sotto questo namespace.

## profile

Documento:

```text
novabeautyUsers/{userId}/profile/main
```

Campi:

```ts
{
  ownerId: string,
  syncId: string,
  businessName: string,
  phone: string,
  address: string,
  email: string,
  openingHours: string,
  description: string,
  businessType: "estetica",
  imageUrl: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Mappatura SwiftUI:

- `nome` -> `businessName`
- `telefono` -> `phone`
- `indirizzo` -> `address`
- `email` -> `email`
- `orari` -> `openingHours`
- `descrizione` -> `description`
- `tipoAttivita` -> `businessType`
- `immagine` -> `imageUrl`

Decisione NovaBeauty:

- `businessType` resta sempre `"estetica"`.
- Non serve piu' una scelta multi-attivita' nella prima versione.

## clients

Collection:

```text
novabeautyUsers/{userId}/clients/{clientId}
```

Campi:

```ts
{
  ownerId: string,
  syncId: string,
  name: string,
  phone: string,
  notes: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Indici/logica:

- Ordinare per `name`.
- Verificare duplicati per `phone` lato applicazione.
- Tutti i clienti letti e scritti solo sotto l'utente autenticato.

## services

Collection:

```text
novabeautyUsers/{userId}/services/{serviceId}
```

Campi:

```ts
{
  ownerId: string,
  syncId: string,
  name: string,
  price: number,
  durationMinutes: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Indici/logica:

- Ordinare per `name`.
- Validare `price >= 0`.
- Validare `durationMinutes > 0`.
- Bloccare duplicati per nome lato applicazione.

## appointments

Collection:

```text
novabeautyUsers/{userId}/appointments/{appointmentId}
```

Campi:

```ts
{
  ownerId: string,
  syncId: string,
  date: Timestamp,
  clientId: string,
  clientNameSnapshot: string,
  serviceName: string,
  serviceId: string | null,
  price: number,
  reminderMinutes: number,
  notificationIdentifier: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Mappatura SwiftUI:

- `data` -> `date`
- `cliente.syncID` o document id -> `clientId`
- `servizio` -> `serviceName`
- `prezzo` -> `price`
- `notificationIdentifier` -> `notificationIdentifier`

Nota:

- Beauty Souls salva il servizio nell'appuntamento come stringa. NovaBeauty puo' aggiungere `serviceId` per riferimento, ma deve mantenere `serviceName` snapshot per replicare il comportamento attuale.
- `clientNameSnapshot` permette di mostrare appuntamenti anche se il nome cliente cambia o il riferimento non e' disponibile.

Query principali:

- Dashboard oggi: `appointments` filtrati per intervallo inizio/fine giornata.
- Agenda: `appointments` ordinati per `date`.
- Statistiche mese: `appointments` filtrati per intervallo inizio/fine mese.

## settings

Documento:

```text
novabeautyUsers/{userId}/settings/main
```

Campi:

```ts
{
  ownerId: string,
  theme: "estetica",
  locale: "it-IT",
  currency: "EUR",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Uso:

- Tenere impostazioni tecniche minime.
- Non introdurre preferenze nuove nella prima versione.

## products opzionale

Collection opzionale, solo se si decide di portare il magazzino originale:

```text
novabeautyUsers/{userId}/products/{productId}
```

Campi:

```ts
{
  ownerId: string,
  syncId: string,
  name: string,
  category: string,
  quantity: number,
  minimumThreshold: number,
  supplierLink: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Storage

Per immagine profilo:

```text
novabeautyUsers/{userId}/profile/profile.jpg
```

Nel documento `profile/main` salvare solo `imageUrl`.

## Migrazione backup esistente

Beauty Souls oggi salva un backup singolo in:

```text
users/{userId}/backups/current
```

Campi:

```text
payload
version
updatedAt
```

Per NovaBeauty, quel backup va usato solo come sorgente di migrazione. La struttura definitiva deve essere normalizzata in subcollections.
