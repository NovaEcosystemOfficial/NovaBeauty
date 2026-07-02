# Migration Notes

## Obiettivo migrazione

Trasformare Beauty Souls SwiftUI in NovaBeauty PWA Next.js + Firebase, replicando prima i flussi esistenti e adattando il target a sole estetiste.

Non bisogna migrare tutto in modo meccanico. Bisogna riutilizzare modelli, logica, regole e stile, evitando parti iOS-specifiche o fuori target.

## Cosa riutilizzare

## Modelli

### Cliente

Da riutilizzare:

- `nome`
- `telefono`
- `note`
- `ownerID`
- `syncID`

Traduzione consigliata:

- `nome` -> `name`
- `telefono` -> `phone`
- `note` -> `notes`
- `ownerID` -> `ownerId`
- `syncID` -> `syncId`

### Appuntamento

Da riutilizzare:

- `data`
- riferimento cliente
- `servizio`
- `prezzo`
- `notificationIdentifier`
- `ownerID`
- `syncID`

Traduzione consigliata:

- `data` -> `date`
- `cliente` -> `clientId`
- `servizio` -> `serviceName`
- `prezzo` -> `price`
- `notificationIdentifier` -> `notificationIdentifier`

Nota:

- Mantenere `serviceName` come snapshot per fedelta' al comportamento attuale.

### Servizio

Da riutilizzare:

- `nome`
- `prezzo`
- `durata`
- `ownerID`
- `syncID`

Traduzione consigliata:

- `nome` -> `name`
- `prezzo` -> `price`
- `durata` -> `durationMinutes`

### ProfiloAttivita

Da riutilizzare:

- `nome`
- `telefono`
- `indirizzo`
- `email`
- `orari`
- `descrizione`
- `immagine`
- `ownerID`
- `syncID`

Da adattare:

- `tipoAttivita` deve diventare fisso `"estetica"` per NovaBeauty.

### ProdottoMagazzino

Il modello esiste ed e' implementato, ma non e' nel flusso prioritario richiesto per NovaBeauty.

Riutilizzarlo solo se in una fase successiva si decide di includere il magazzino.

## Logica da riutilizzare

### Auth

Riutilizzare concetto:

- Firebase Auth.
- Login email/password.
- Registrazione.
- Reset password.
- Logout.
- Session listener.

Da tradurre in web:

- Firebase Web SDK.
- Auth context/provider.
- Route protection.

### Ownership dati

Regola fondamentale:

- Ogni record appartiene all'utente autenticato.

In SwiftUI:

- filtro per `ownerID == session.userID`

In NovaBeauty:

- dati sotto `users/{uid}/...`
- Firestore rules con `request.auth.uid == userId`

### Validazioni

Da riutilizzare:

- Cliente: nome e telefono obbligatori.
- Cliente: telefono non duplicato.
- Servizio: nome obbligatorio.
- Servizio: prezzo valido e non negativo.
- Servizio: durata maggiore di zero.
- Servizio: nome non duplicato.
- Appuntamento: cliente obbligatorio.
- Appuntamento: servizio obbligatorio.
- Appuntamento: prezzo valido e non negativo.
- Profilo: nome attivita' obbligatorio.

### Calcoli

Da riutilizzare:

- Appuntamenti oggi.
- Incasso oggi.
- Appuntamenti mese corrente.
- Incasso mensile.
- Cliente top.

### Parsing prezzo

Beauty Souls accetta sia virgola sia punto nei decimali.

Da mantenere:

- `12,50`
- `12.50`

### Ordinamenti

Da riutilizzare:

- Clienti ordinati per nome.
- Servizi ordinati per nome.
- Appuntamenti ordinati per data.

## Colori da riutilizzare

Usare il tema estetica:

```text
primary:    #D8A7B1
secondary:  #EAC7CF
background: #FFFFFF
card:       #F8F4F6
text:       #000000
```

Non portare come tema principale:

- Barber nero/oro.
- Nails viola.
- Parrucchiere grigio.

Motivo:

- NovaBeauty ha target solo estetiste.

## Icone da riutilizzare

Equivalenti SwiftUI:

- `house.fill` -> Home.
- `calendar` -> Appuntamenti.
- `person.3.fill` -> Clienti.
- `scissors` -> Servizi.
- `chart.bar.fill` -> Statistiche.
- `person.crop.circle.fill` -> Profilo.
- `plus` -> aggiunta.
- `camera.fill` -> immagine profilo.

In React usare una libreria coerente, per esempio Lucide React.

## Flussi da riutilizzare

Da replicare:

- Splash/login.
- Dashboard con dati del giorno.
- Nuovo appuntamento da dashboard.
- Lista appuntamenti.
- Lista e aggiunta clienti.
- Lista e aggiunta servizi.
- Statistiche mensili.
- Profilo attivita'.
- Logout.

Da adattare:

- Scelta tipo attivita': rimuovere o sostituire con inizializzazione automatica estetica.
- Notifiche locali: tradurre in notifiche web/PWA solo dopo replica base.
- ImagePicker iOS: sostituire con input file web + Firebase Storage.

## Cosa NON conviene migrare

### SwiftData

Non migrare direttamente:

- `@Model`
- `@Query`
- `ModelContext`
- relazioni SwiftData

Sostituzione:

- Firestore collections.
- Query per utente.
- Hook/service dati React.

### Backup Firestore attuale

Non usare come struttura definitiva:

```text
users/{uid}/backups/current
```

Motivo:

- Payload unico codificato.
- Non queryable.
- Non adatto a dashboard e statistiche web.

Usarlo solo come possibile sorgente di migrazione.

### UIKit ImagePicker

Non migrare:

- `UIImagePickerController`
- `UIViewControllerRepresentable`
- `UIImage`
- `Data` immagine nel modello

Sostituzione:

- input file.
- preview immagine.
- Firebase Storage.
- URL nel profilo.

### UserNotifications iOS

Non migrare direttamente:

- `UNUserNotificationCenter`
- `UNNotificationRequest`
- `UNTimeIntervalNotificationTrigger`

Sostituzione futura:

- Notification API browser.
- Service worker.
- Permessi notifiche PWA.

### Contacts iOS

Non migrare direttamente:

- `CNContactStore`
- import rubrica iOS.

Motivo:

- Non e' supportato in modo uniforme sul web.
- Non deve bloccare la prima replica PWA.

### Temi fuori target

Non migrare nella prima versione:

- Barber.
- Nails.
- Parrucchiere.

NovaBeauty deve partire con identita' estetica unica.

### File residui o non gestionali

Non usare come base PWA:

- `Item.swift`, residuo template.
- `index.html`, landing statica promozionale.
- `README.md`, boilerplate GitHub.

## Note finali

La migrazione professionale deve procedere cosi':

1. Replicare fedelmente il flusso Beauty Souls.
2. Normalizzare dati in Firestore.
3. Mantenere design rosa cipria.
4. Limitare il target alle estetiste.
5. Evitare nuove feature fino al completamento della PWA base.
