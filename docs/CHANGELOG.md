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
- Modulo **Magazzino** con dashboard a 4 sezioni: Prodotti, Fornitori, Da ordinare, Movimenti.
- Collection Firestore `products`, `suppliers` e `stockMovements` sotto `novabeautyUsers/{uid}/`.

### Changed

- `/profile` reindirizza a `/studio/mio-studio` per deep link e notifiche legacy.
- `/studio/magazzino` diventa hub del modulo magazzino con sottopagine dedicate.

### Notes

- Nessuna modifica distruttiva a notifiche push, token FCM o cronologia esistenti.
- Nessuna automazione su appuntamenti, servizi o consumi nel modulo Magazzino.
- La collection legacy `inventory` resta documentata; il nuovo modulo usa `products`.

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
