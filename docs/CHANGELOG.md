# Nova Ecosystem Changelog

Registro delle modifiche infrastrutturali.

## 2026-07-05

### Added

- Definita documentazione ufficiale Nova Ecosystem.
- Introdotti principi Nova Core.
- Stabilito `users/{uid}` come identita' centrale condivisa.
- Stabilito uso di namespace app-specifici, per esempio `novabeautyUsers/{uid}`.
- Documentato standard Environment in `ENVIRONMENT.md`.
- Documentato controllo impatto prima di modifiche infrastrutturali.

### Notes

- NovaBeauty e' trattata come applicazione dell'ecosistema, non come progetto isolato.
- Ogni futura modifica a Firebase, Firestore Rules, Environment, Deploy o Architettura deve aggiornare la documentazione.
