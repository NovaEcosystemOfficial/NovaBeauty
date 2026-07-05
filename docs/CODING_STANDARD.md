# Nova Ecosystem Coding Standard

## Scopo

Questo documento definisce convenzioni tecniche riutilizzabili per tutte le applicazioni Nova.

## Naming

Applicazioni:

```text
NovaBeauty
NovaPromo
NovaDocs
NovaJob
```

Namespace Firestore:

```text
novabeautyUsers
novapromoUsers
novadocsUsers
novajobUsers
```

Variabili ambiente:

```text
NEXT_PUBLIC_FIREBASE_*
```

Componenti React:

```text
PascalCase
```

Funzioni e variabili:

```text
camelCase
```

Tipi TypeScript:

```text
PascalCase
```

## Struttura Cartelle Web

Pattern consigliato:

```text
web/
  src/
    app/
    components/
    contexts/
    lib/
    types/
  scripts/
  docs/
  .env.example
```

## Componenti

Componenti condivisibili:

- bottoni
- input
- card
- layout shell
- stati loading/error/success
- dialog
- navigazione

Regole:

- componenti UI non devono conoscere Firestore
- logica dati in `lib/` o hook dedicati
- componenti app-specifici separati da componenti generici

## TypeScript

Regole:

- usare `strict`
- evitare `any`
- tipizzare documenti Firestore
- separare tipi Core da tipi app-specifici
- non duplicare tipi tra app quando possono essere condivisi

## React / Next.js

Regole:

- usare App Router
- usare Server Components di default
- usare Client Components solo quando servono stato, effetti o browser API
- proteggere route private con guard centralizzate
- non fare query Firestore direttamente in componenti UI primitivi

## Firebase

Regole:

- Core identity in `users/{uid}`
- dati app in namespace dedicato
- path helper centralizzati
- errori Firebase devono mostrare codice diagnostico utile

## Documentazione

Ogni modifica infrastrutturale deve aggiornare:

- `ARCHITECTURE.md` se cambia architettura
- `FIREBASE.md` se cambia Firebase
- `ENVIRONMENT.md` se cambiano env
- `SECURITY.md` se cambiano permessi/rules
- `CHANGELOG.md` per il registro
