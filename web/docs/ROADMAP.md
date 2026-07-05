# Roadmap

## Milestone 1 - Setup progetto

Obiettivo:

Preparare il progetto Next.js senza implementare feature complesse.

Attivita':

- Creare progetto Next.js.
- Configurare TypeScript.
- Configurare ESLint e formatter.
- Configurare struttura cartelle.
- Installare Firebase Web SDK.
- Preparare variabili ambiente.
- Preparare layout mobile-first.
- Creare tema base NovaBeauty.

Output:

- App Next.js avviabile.
- Struttura pronta per auth, dati e componenti.

## Milestone 2 - Auth

Obiettivo:

Replicare login, registrazione, reset password e sessione Firebase.

Attivita':

- Configurare Firebase Auth.
- Creare Login page.
- Creare registrazione.
- Creare reset password.
- Creare guard route autenticata.
- Creare documento `users/{uid}` al primo accesso.

Output:

- Utente puo' entrare, uscire e recuperare password.

## Milestone 3 - Dashboard

Obiettivo:

Ricreare la Home di Beauty Souls.

Attivita':

- Creare AppShell.
- Creare BottomNavigation.
- Creare dashboard cards.
- Leggere appuntamenti di oggi.
- Calcolare incasso giornaliero.
- Aggiungere azione "Nuovo Appuntamento".

Output:

- Dashboard funzionante con dati reali Firestore.

## Milestone 4 - Clienti

Obiettivo:

Gestire clienti.

Attivita':

- Creare collection `clients`.
- Creare lista clienti.
- Creare form aggiunta cliente.
- Validare nome e telefono.
- Bloccare duplicati telefono.
- Implementare eliminazione.

Output:

- CRUD clienti base.

## Milestone 5 - Appuntamenti

Obiettivo:

Gestire agenda e creazione appuntamenti.

Attivita':

- Creare collection `appointments`.
- Creare lista appuntamenti ordinata.
- Creare form nuovo appuntamento.
- Collegare clienti.
- Collegare servizi.
- Autocompilare prezzo da servizio.
- Implementare eliminazione.
- Salvare reminderMinutes, anche se notifiche PWA verranno rifinite dopo.

Output:

- Agenda equivalente a Beauty Souls.

## Milestone 6 - Servizi

Obiettivo:

Gestire listino servizi.

Attivita':

- Creare collection `services`.
- Creare lista servizi.
- Creare form aggiunta servizio.
- Validare prezzo e durata.
- Bloccare duplicati nome.
- Implementare eliminazione.

Output:

- Catalogo servizi operativo.

## Milestone 7 - Statistiche

Obiettivo:

Replicare statistiche mensili.

Attivita':

- Calcolare appuntamenti mese corrente.
- Calcolare incasso mensile.
- Calcolare cliente top.
- Creare card statistiche.

Output:

- Schermata statistiche fedele a Beauty Souls.

## Milestone 8 - Profilo

Obiettivo:

Gestire profilo attivita'.

Attivita':

- Creare documento `profile/main`.
- Creare form profilo.
- Salvare nome, telefono, indirizzo, email, orari, descrizione.
- Implementare upload immagine profilo.
- Implementare logout.

Output:

- Profilo modificabile e persistente.

## Milestone 9 - PWA

Obiettivo:

Rendere NovaBeauty installabile e usabile come app.

Attivita':

- Creare manifest.
- Configurare icone.
- Configurare service worker.
- Verificare installabilita'.
- Ottimizzare mobile viewport.
- Preparare stati offline minimi.

Output:

- PWA installabile da smartphone.

## Milestone 10 - Deploy

Obiettivo:

Pubblicare la prima versione.

Attivita':

- Configurare Firebase Hosting o hosting scelto.
- Configurare variabili ambiente.
- Pubblicare Firestore rules.
- Testare login e dati in produzione.
- Verificare mobile.
- Verificare installazione PWA.

Output:

- NovaBeauty online, pronta per utilizzo reale.
