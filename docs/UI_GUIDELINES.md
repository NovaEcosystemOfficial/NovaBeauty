# Nova Ecosystem UI Guidelines

## Scopo

Le applicazioni Nova devono sembrare parte dello stesso ecosistema pur mantenendo identita' verticali.

NovaBeauty usa un linguaggio estetico premium, mobile-first e professionale.

## Principi UI

- chiarezza
- leggerezza
- accessibilita'
- mobile-first
- componenti coerenti
- nessuna decorazione inutile
- stati loading, empty, error e success sempre previsti

## Design System Nova

Ogni app deve avere:

- design tokens
- palette chiara/scura
- tipografia
- spacing
- radius
- shadow
- motion
- componenti base

## Palette

NovaBeauty:

```text
Primary:    #D8A7B1
Secondary:  #EAC7CF
Background: #FFFFFF
Card:       #F8F4F6
Text:       #000000
Danger:     #E5484D
Success:    #2E7D32
```

Altre app possono avere palette dedicate, ma devono mantenere:

- contrasto leggibile
- token condivisi
- dark mode compatibile
- naming coerente

## Tipografia

Standard:

```text
Inter, SF Pro, Arial, sans-serif
```

Regole:

- titoli grandi solo per pagine principali
- card compatte
- bottoni con testo breve
- nessun testo sovrapposto

## Componenti Base

Componenti comuni:

- `PrimaryButton`
- `SecondaryButton`
- `DangerButton`
- `FormField`
- `Card`
- `IconBadge`
- `EmptyState`
- `LoadingState`
- `ErrorMessage`
- `SuccessMessage`

## Navigazione

Le app mobile-first possono usare Bottom Navigation.

Regole:

- icone coerenti
- stato attivo chiaro
- label brevi
- layout stabile

## Motion

Animazioni leggere:

- fade
- slide breve
- press feedback
- transizioni 160-420ms

Evitare:

- animazioni decorative pesanti
- gradienti dominanti
- effetti che riducono leggibilita'

## Compatibilita' Ecosistema

Quando un componente puo' servire piu' app, progettarlo generico e app-specifico tramite props/tokens.
