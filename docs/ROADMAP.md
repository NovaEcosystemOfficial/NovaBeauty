# Nova Ecosystem Roadmap

## Obiettivo

Trasformare Nova in una piattaforma software scalabile in cui ogni nuova applicazione puo' essere aggiunta senza modificare o rompere l'infrastruttura esistente.

## Fase 1 - Fondamenta Ecosistema

Stato: in corso.

Attivita':

- definire architettura Nova Core
- standardizzare environment
- separare namespace app-specifici
- documentare Firebase condiviso
- documentare deploy e sicurezza
- introdurre controllo impatto infrastrutturale

Output:

- documentazione ufficiale in `docs/`
- standard riutilizzabile da tutte le app Nova

## Fase 2 - NovaBeauty Base

Stato: in corso.

Attivita':

- PWA Next.js in `web/`
- Firebase Auth
- namespace `novabeautyUsers`
- dashboard grafica
- design system app-specifico
- env validation

Output:

- NovaBeauty pronta a diventare prodotto funzionante senza rompere Nova Core

## Fase 3 - Data Layer Riutilizzabile

Attivita':

- creare helper Firestore per namespace app
- validazioni condivise
- gestione errori Firebase standard
- convenzioni timestamp e ownership
- storage path standard

Output:

- base dati riutilizzabile da NovaPromo, NovaDocs, NovaJob e future app

## Fase 4 - Moduli Condivisi

Attivita':

- auth guard condivisibile
- componenti UI core
- env checker riutilizzabile
- deploy checklist comune
- logger diagnostico

Output:

- riduzione duplicazione tra app Nova

## Fase 5 - Nuove App Nova

Candidate:

- NovaPromo
- NovaDocs
- NovaJob
- NovaMobile

Regola:

Ogni nuova app deve usare namespace dedicato e non modificare `users/{uid}` oltre ai campi Core documentati.

## Fase 6 - Governance Infrastrutturale

Attivita':

- changelog infrastrutturale obbligatorio
- review Firestore Rules
- dry-run prima deploy Firebase
- rollback plan per deploy critici
- audit periodico env Vercel/Firebase

Output:

- crescita controllata dell'ecosistema
