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
```

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
