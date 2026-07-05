# Components

## Componenti layout

### AppShell

Wrapper principale dell'area autenticata.

Responsabilita':

- Applicare tema.
- Mostrare `TopHeader`.
- Mostrare `BottomNavigation`.
- Gestire layout mobile-first.

### AuthShell

Wrapper per login, registrazione e reset password.

Responsabilita':

- Centrare contenuto.
- Mantenere stile Beauty Souls.
- Mostrare logo/nome NovaBeauty.

### TopHeader

Header superiore delle schermate.

Props:

- `title`
- `subtitle`
- `action`

Uso:

- Dashboard.
- Liste principali.
- Profilo.

### BottomNavigation

Navigazione principale mobile.

Tab:

- Home.
- Clienti.
- Appuntamenti.
- Servizi.
- Profilo.

Nota:

- Statistiche possono essere tab separata o voce secondaria, ma devono restare accessibili come in Beauty Souls.

## Componenti dashboard

### DashboardCard

Card riepilogativa per appuntamenti di oggi e incasso.

Props:

- `title`
- `value`
- `caption`
- `variant`

### TodaySummary

Blocco dashboard con:

- appuntamenti oggi
- incasso oggi

### FloatingActionButton

Bottone azione principale per creare appuntamento.

Uso:

- Dashboard.
- Appuntamenti.

## Componenti appuntamenti

### AppointmentCard

Card/list item per appuntamento.

Props:

- `clientName`
- `serviceName`
- `date`
- `price`
- `onDelete`

### AppointmentForm

Form nuovo appuntamento.

Campi:

- cliente
- data
- promemoria
- servizio
- prezzo

### AppointmentList

Lista appuntamenti ordinata.

Responsabilita':

- Stato loading.
- Stato vuoto.
- Rendering `AppointmentCard`.

### ReminderSelect

Select per promemoria.

Valori:

- nessuno
- 30 minuti prima
- 1 ora prima
- 2 ore prima
- 1 giorno prima

## Componenti clienti

### ClientCard

Card/list item cliente.

Props:

- `name`
- `phone`
- `onDelete`

### ClientForm

Form aggiunta cliente.

Campi:

- nome
- telefono

Regole:

- nome obbligatorio
- telefono obbligatorio
- telefono non duplicato

### ClientList

Lista clienti ordinata alfabeticamente.

## Componenti servizi

### ServiceCard

Card/list item servizio.

Props:

- `name`
- `price`
- `durationMinutes`
- `onDelete`

### ServiceForm

Form aggiunta servizio.

Campi:

- nome servizio
- prezzo
- durata minuti

### ServiceSelect

Select riutilizzabile per scegliere un servizio nel form appuntamento.

Responsabilita':

- Mostrare nome e durata.
- Restituire servizio scelto.
- Consentire autocompilazione prezzo.

## Componenti statistiche

### StatisticsCard

Replica web di `StatCard`.

Props:

- `title`
- `value`

### MonthlyStatistics

Sezione con:

- incasso mensile
- numero appuntamenti
- cliente top

## Componenti profilo

### ProfileCard

Card riepilogo profilo attivita'.

Contenuti:

- immagine o placeholder
- nome attivita'
- descrizione breve

### ProfileForm

Form modifica profilo.

Campi:

- nome attivita'
- telefono
- indirizzo
- email
- orari
- descrizione

### ProfileImagePicker

Input immagine profilo.

Responsabilita':

- Preview immagine.
- Upload su Firebase Storage.
- Aggiornamento `imageUrl`.

## Componenti comuni

### PrimaryButton

Bottone principale rosa cipria.

### SecondaryButton

Bottone secondario con background card.

### DangerButton

Bottone distruttivo per eliminazioni o logout dove opportuno.

### IconButton

Bottone solo icona.

### FormField

Input testuale standard.

### CurrencyField

Input prezzo con parsing decimale.

### NumberField

Input numerico per durata.

### EmptyState

Stato vuoto per liste senza dati.

### LoadingState

Stato caricamento.

### ErrorMessage

Messaggio errore.

### SuccessMessage

Messaggio conferma.

### ConfirmDialog

Dialog conferma eliminazione.

### AppDialog

Dialog generico per form modali.

### Card

Primitive UI per card Beauty Souls.
