# Design System

## Direzione visiva

NovaBeauty deve rimanere fedele all'attuale Beauty Souls, ma focalizzata solo sul mondo estetica.

Lo stile deve essere:

- Pulito.
- Femminile senza diventare decorativo.
- Mobile-first.
- Morbido.
- Professionale.
- Leggero.

## Palette colori

Palette principale, derivata dal tema `estetica` di Beauty Souls:

```text
Primary:    #D8A7B1
Secondary:  #EAC7CF
Background: #FFFFFF
Card:       #F8F4F6
Text:       #000000
Muted Text: rgba(0, 0, 0, 0.60)
Border:     rgba(0, 0, 0, 0.08)
Danger:     #E5484D
Success:    #2E7D32
```

Uso:

- `Primary`: titoli importanti, bottoni principali, icone attive.
- `Secondary`: valori numerici, accenti morbidi.
- `Background`: sfondo principale.
- `Card`: card, input custom, sezioni leggere.
- `Text`: testo principale.
- `Muted Text`: dettagli, sottotitoli, metadati.

## Typography

Font consigliato:

- Sistema: `Inter`, `SF Pro`, `Arial`, sans-serif.
- Se si vuole riprendere la landing esistente: `Poppins`.

Scala:

```text
Display / page title: 32px, 700
Section title:        24px, 700
Card title:           17px, 600
Body:                 15px, 400
Small:                13px, 400
Caption:              12px, 400
```

Regole:

- Titoli grandi solo nelle schermate principali.
- Liste e card devono restare compatte.
- Evitare testi lunghi dentro bottoni.

## Spacing

Scala spacing:

```text
4px
8px
12px
16px
20px
24px
32px
```

Uso:

- Padding pagina mobile: 16px.
- Gap tra sezioni: 20px o 24px.
- Gap dentro card: 8px o 12px.
- Padding card: 16px.

## Card

Stile card fedele a Beauty Souls:

```text
background: #F8F4F6
border-radius: 20px per dashboard/statistiche
border-radius: 12px per elementi lista/form
shadow: leggero, equivalente shadow radius 5 SwiftUI
padding: 16px
```

Regole:

- Card ampie per riepiloghi.
- List item piu' compatti per clienti, servizi e appuntamenti.
- Non usare card annidate.

## Bottoni

### Primary Button

Uso:

- Salva.
- Aggiungi.
- Nuovo appuntamento.

Stile:

```text
background: #D8A7B1
color: #FFFFFF
border-radius: 15px
height: 48px
font-weight: 600
```

### Secondary Button

Uso:

- Azioni secondarie.
- Link interni.

Stile:

```text
background: #F8F4F6
color: #000000
border-radius: 12px
height: 44px
```

### Danger Button

Uso:

- Eliminazione.
- Azioni distruttive confermate.

Stile:

```text
background: #E5484D
color: #FFFFFF
border-radius: 15px
```

## Input

Stile:

```text
background: #F8F4F6 oppure white
border: 1px solid rgba(0,0,0,0.08)
border-radius: 12px
height: 44px
padding: 12px
font-size: 15px
```

Campi:

- Nome cliente.
- Telefono.
- Nome servizio.
- Prezzo.
- Durata.
- Data appuntamento.
- Nome attivita'.
- Indirizzo.
- Email.
- Orari.
- Descrizione.

Regole:

- Errori sotto il campo o in alert.
- Prezzi in EUR.
- Parsing decimale compatibile con virgola e punto.

## Dialog

Uso:

- Nuovo appuntamento.
- Conferma eliminazione.
- Messaggi di errore.

Stile:

```text
background: #FFFFFF
border-radius: 20px
padding: 20px
shadow: medio
```

Su mobile:

- Preferire bottom sheet o pagina dedicata per form lunghi.
- Mantenere azioni "Salva" e "Annulla" chiare.

## Bottom Navigation

Tab principali:

- Home.
- Clienti.
- Appuntamenti.
- Servizi.
- Profilo.

Statistiche:

- Accessibili da tab dedicata se si mantiene il numero di tab dell'app originale.
- In alternativa accessibili dalla Dashboard, ma solo se non altera troppo la replica.

Stile:

```text
position: fixed bottom
height: 64px
background: #FFFFFF
border-top: 1px solid rgba(0,0,0,0.08)
active color: #D8A7B1
inactive color: rgba(0,0,0,0.55)
```

Icone equivalenti:

- Home: house.
- Clienti: users.
- Appuntamenti: calendar.
- Servizi: scissors.
- Statistiche: bar chart.
- Profilo: user circle.

## Animazioni

Animazioni fedeli a Beauty Souls:

- Splash logo: scala da 0.8 a 1.0.
- Splash opacity da 0 a 1.
- Cambio tema leggero: 300ms ease-in-out.
- Apertura dialog/bottom sheet: 180-240ms.
- Press feedback bottoni: opacita' o scale molto lieve.

Evitare:

- Animazioni decorative pesanti.
- Gradienti dominanti.
- Effetti non presenti nel concept originale.

## Responsive

Priorita':

1. Smartphone.
2. Tablet.
3. Desktop.

Desktop:

- Contenuto centrato con larghezza massima.
- Bottom navigation puo' rimanere se si vuole mantenere replica app-like.
- Non trasformare in dashboard SaaS complessa nella prima versione.
