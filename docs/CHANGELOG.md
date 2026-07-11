# Nova Ecosystem Changelog

Registro delle modifiche infrastrutturali.

## 2026-07-11

### Added

- Introdotto **Studio** come hub operativo NovaBeauty nella bottom navigation.
- Notifiche spostate sotto Studio mantenendo la route `/notifications` compatibile.
- Predisposto namespace `novabeautyUsers/{uid}/inventory/{productId}` per il futuro Magazzino.
- Aggiunta pagina iniziale Magazzino e Impostazioni app sotto Studio.
- Riorganizzata la navigazione: rimossa la tab **Profilo**, bottom bar a 5 voci.
- Aggiunta sezione **Il mio studio** (`/studio/mio-studio`) con il contenuto ex Profilo.
- Predisposta architettura hub Studio (`studio-hub.ts`) per sezioni future.

### Changed

- `/profile` reindirizza a `/studio/mio-studio` per deep link e notifiche legacy.

### Notes

- Nessuna modifica distruttiva a notifiche push, token FCM o cronologia esistenti.
- La collection legacy `products` resta documentata ma non viene sostituita da `inventory`.

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
