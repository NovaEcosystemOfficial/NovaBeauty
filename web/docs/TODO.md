# TODO

## Preparazione

- [ ] Creare nuovo progetto Next.js su Windows.
- [ ] Copiare questa cartella `docs` come riferimento iniziale.
- [ ] Configurare repository Git del nuovo progetto.
- [ ] Decidere nome pacchetto e dominio.
- [ ] Preparare progetto Firebase web.
- [ ] Recuperare configurazione Firebase.

## Setup tecnico

- [ ] Installare Next.js.
- [ ] Abilitare TypeScript.
- [ ] Configurare ESLint.
- [ ] Configurare formatter.
- [ ] Configurare alias import.
- [ ] Configurare variabili `.env.local`.
- [ ] Installare Firebase SDK.
- [ ] Creare modulo Firebase client.
- [ ] Creare struttura cartelle.

## Design system

- [ ] Definire CSS variables del tema.
- [ ] Implementare palette estetica.
- [ ] Implementare card base.
- [ ] Implementare bottoni.
- [ ] Implementare input.
- [ ] Implementare dialog.
- [ ] Implementare bottom navigation.
- [ ] Verificare mobile layout.

## Auth

- [ ] Creare pagina login.
- [ ] Creare azione login.
- [ ] Creare azione registrazione.
- [ ] Creare azione reset password.
- [ ] Creare gestione sessione.
- [ ] Creare route guard.
- [ ] Creare logout.
- [ ] Creare documento utente al primo accesso.

## Firestore

- [ ] Creare struttura `users/{uid}`.
- [ ] Creare `profile/main`.
- [ ] Creare `clients`.
- [ ] Creare `services`.
- [ ] Creare `appointments`.
- [ ] Creare `settings/main`.
- [ ] Scrivere Firestore rules.
- [ ] Testare isolamento dati per utente.

## Dashboard

- [ ] Creare pagina dashboard.
- [ ] Creare `DashboardCard`.
- [ ] Leggere appuntamenti di oggi.
- [ ] Calcolare numero appuntamenti oggi.
- [ ] Calcolare incasso oggi.
- [ ] Aggiungere bottone nuovo appuntamento.
- [ ] Aggiungere link TikTok se richiesto.

## Clienti

- [ ] Creare pagina clienti.
- [ ] Creare `ClientList`.
- [ ] Creare `ClientCard`.
- [ ] Creare `ClientForm`.
- [ ] Salvare cliente.
- [ ] Validare nome obbligatorio.
- [ ] Validare telefono obbligatorio.
- [ ] Bloccare duplicati telefono.
- [ ] Eliminare cliente.
- [ ] Gestire stato vuoto.

## Appuntamenti

- [ ] Creare pagina appuntamenti.
- [ ] Creare `AppointmentList`.
- [ ] Creare `AppointmentCard`.
- [ ] Creare `AppointmentForm`.
- [ ] Caricare clienti nel form.
- [ ] Caricare servizi nel form.
- [ ] Autocompilare prezzo dal servizio.
- [ ] Salvare appuntamento.
- [ ] Validare data.
- [ ] Validare cliente.
- [ ] Validare servizio.
- [ ] Validare prezzo.
- [ ] Eliminare appuntamento.
- [ ] Calcolare reminderMinutes.

## Servizi

- [ ] Creare pagina servizi.
- [ ] Creare `ServiceList`.
- [ ] Creare `ServiceCard`.
- [ ] Creare `ServiceForm`.
- [ ] Salvare servizio.
- [ ] Validare nome.
- [ ] Validare prezzo.
- [ ] Validare durata.
- [ ] Bloccare duplicati nome.
- [ ] Eliminare servizio.

## Statistiche

- [ ] Creare pagina statistiche.
- [ ] Creare `StatisticsCard`.
- [ ] Calcolare incasso mensile.
- [ ] Calcolare numero appuntamenti mese.
- [ ] Calcolare cliente top.
- [ ] Gestire assenza dati.

## Profilo

- [ ] Creare pagina profilo.
- [ ] Creare `ProfileCard`.
- [ ] Creare `ProfileForm`.
- [ ] Creare `ProfileImagePicker`.
- [ ] Salvare dati profilo.
- [ ] Caricare dati profilo.
- [ ] Implementare upload immagine.
- [ ] Salvare `imageUrl`.
- [ ] Implementare logout.

## PWA

- [ ] Creare manifest.
- [ ] Creare icone.
- [ ] Configurare theme color.
- [ ] Configurare service worker.
- [ ] Verificare installazione su mobile.
- [ ] Verificare splash PWA.
- [ ] Verificare offline shell minima.

## Deploy

- [ ] Configurare hosting.
- [ ] Configurare variabili produzione.
- [ ] Pubblicare Firestore rules.
- [ ] Deploy preview.
- [ ] Test auth in produzione.
- [ ] Test CRUD in produzione.
- [ ] Test mobile.
- [ ] Deploy finale.
