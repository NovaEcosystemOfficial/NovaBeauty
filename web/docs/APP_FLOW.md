# App Flow

## Schermate da replicare

NovaBeauty deve ricreare le schermate operative di Beauty Souls, adattandole al web senza cambiare il flusso.

Schermate principali:

- Splash / loading iniziale.
- Login.
- Registrazione.
- Recupero password.
- Dashboard.
- Clienti.
- Appuntamenti / Agenda.
- Nuovo appuntamento.
- Servizi.
- Statistiche.
- Profilo.

Schermate da non portare come feature principale:

- Scelta attivita' multi-target, perche' NovaBeauty e' solo per estetiste.
- Magazzino, salvo decisione successiva. In Beauty Souls esiste, ma il nuovo target iniziale richiesto e' il flusso estetiste: Login, Dashboard, Clienti, Appuntamenti, Servizi, Profilo.
- Landing statica `index.html`, perche' non e' la PWA gestionale.

## Navigazione completa

Flusso di ingresso:

```text
Avvio PWA
  -> Splash / controllo sessione
    -> utente non autenticato
      -> Login
    -> utente autenticato
      -> Dashboard
```

Flusso autenticazione:

```text
Login
  -> Accedi
    -> Dashboard
  -> Registrati
    -> crea account Firebase
    -> Dashboard o richiesta verifica email, in base alla configurazione finale
  -> Password dimenticata
    -> invia email reset
    -> resta su Login con messaggio di conferma
```

Navigazione principale autenticata:

```text
Dashboard
  -> Clienti
  -> Appuntamenti
  -> Servizi
  -> Statistiche
  -> Profilo
```

La navigazione mobile deve usare una Bottom Navigation fedele alla TabView iOS.

## User flow richiesto

Flusso principale da rispettare:

```text
Login
  -> Dashboard
    -> Clienti
      -> Appuntamenti
        -> Servizi
          -> Profilo
```

Questo non significa navigazione lineare obbligatoria, ma priorita' progettuale:

1. L'utente entra.
2. Vede subito situazione del giorno.
3. Gestisce i clienti.
4. Crea o consulta appuntamenti.
5. Usa i servizi come listino.
6. Completa o aggiorna il profilo attivita'.

## Dashboard

Contenuti:

- Nome attivita', default "NovaBeauty" o nome salvato nel profilo.
- Numero appuntamenti di oggi.
- Incasso stimato di oggi.
- Bottone "Nuovo Appuntamento".
- Link TikTok se mantenuto dal progetto originale.

Azioni:

- Aprire form nuovo appuntamento.
- Navigare alle sezioni principali dalla Bottom Navigation.

## Clienti

Contenuti:

- Lista clienti dell'utente autenticato.
- Nome cliente.
- Telefono.
- Form per aggiungere cliente.

Azioni:

- Aggiungere cliente.
- Eliminare cliente.
- Validare nome e telefono obbligatori.
- Bloccare duplicati per telefono.

## Appuntamenti

Contenuti:

- Lista appuntamenti ordinata per data.
- Cliente.
- Servizio.
- Prezzo.
- Data e ora.

Azioni:

- Creare appuntamento.
- Selezionare cliente esistente.
- Selezionare servizio esistente.
- Autocompilare prezzo dal servizio.
- Modificare prezzo manualmente.
- Eliminare appuntamento.

## Servizi

Contenuti:

- Lista servizi.
- Nome servizio.
- Prezzo.
- Durata.
- Form aggiunta servizio.

Azioni:

- Aggiungere servizio.
- Eliminare servizio.
- Validare nome, prezzo e durata.
- Bloccare duplicati per nome.

## Statistiche

Contenuti:

- Incasso mensile.
- Numero appuntamenti del mese.
- Cliente top.

Regole:

- I calcoli usano solo appuntamenti dell'utente autenticato.
- Il mese corrente e' calcolato dalla data appuntamento.

## Profilo

Contenuti:

- Foto profilo o placeholder.
- Nome attivita'.
- Telefono.
- Indirizzo.
- Email.
- Orari.
- Descrizione.
- Logout.

Azioni:

- Salvare profilo.
- Caricare immagine profilo.
- Uscire dall'account.

## Stati comuni

Ogni schermata deve prevedere:

- Loading.
- Stato vuoto.
- Errore leggibile.
- Conferma azione riuscita dove gia' presente in Beauty Souls.
- Protezione dati per utente autenticato.
