# Mekkompis 🏍️

En personlig mek-loggbok för din motorcykel där du kan dokumentera underhåll, reparationer och modifieringar.

## Aktuell version: v0.3

### Funktioner

**Motorcykelhantering**
- Hantera flera motorcyklar samtidigt
- Spara märke, modell, årsmodell, registreringsnummer och milantal
- Se översikt med statistik per motorcykel (antal jobb, total kostnad)
- Redigera och ta bort motorcyklar med säker bekräftelse

**Mek-jobb**
- Skapa och spara mek-jobb med titel, datum, beskrivning och milantal
- Lägg till kostnad per jobb
- Markera jobb som klara med checkbox
- Filtrera jobb (alla, pågående, klara)
- Sortera jobb (nyast först, äldst först, högst kostnad)
- Se alla jobb per motorcykel
- Formulärvalidering för datum och numeriska värden

**Inköpslista**
- Lägg till artiklar med antal (t.ex. "Olja (3 st)")
- Kryssa av när du köpt något
- Redigera artiklar och antal
- Ta bort artiklar

**Dokumentation**
- Ladda upp bilder till varje jobb
- Visa bilder i fullskärm (lightbox) med ESC-stöd
- Ta bort bilder med hover-knapp
- Lägg till anteckningar och tutorials
- Allt lagras per jobb för enkel återblick

**Användarvänlighet**
- Toast-notifikationer för feedback på alla åtgärder
- Bekräftelsedialoger för borttagning
- Tangentbordsnavigation (Enter, Space, ESC)
- ARIA-labels för bättre tillgänglighet
- Loading states under API-anrop
- Visuell feedback vid hover och fokus

## Tech Stack

### Frontend
- **React** - JavaScript-bibliotek för att bygga användargränssnitt
- **Vite** - Supersnabb build-tool och dev-server
- **Vanilla CSS** - Ren CSS för full kontroll och snabba laddningstider

### Backend
- **Node.js** - JavaScript-runtime för servern
- **Express.js** - Minimalistiskt och flexibelt webb-framework
- **Multer v2.0** - Middleware för filuppladdningar (bilder)
- **CORS** - Cross-Origin Resource Sharing

### Databas
- **SQLite** - Lättviktig, fil-baserad databas (perfekt för lokal utveckling)
- **better-sqlite3** - Snabb och enkel Node.js-binding för SQLite

### API & Kommunikation
- **REST API** - Klassisk HTTP-baserad API-arkitektur med JSON
- **Hot Module Replacement (HMR)** - Vite uppdaterar ändringar direkt i browsern

### Verktyg
- **Git** - Versionshantering
- **npm** - Pakethanterare

### Varför denna stack?
✅ Enkel att komma igång med - minimalt med konfiguration
✅ Snabb utveckling - Vite ger instant feedback
✅ Lätt att deploya - kan köras på nästan alla webbhotell
✅ Skalbar - lätt att uppgradera SQLite till MySQL/PostgreSQL senare
✅ Modern men inte överkomplext - perfekt balans för en MVP

## Kom igång

### Krav
- Node.js (v18 eller senare)

### Installation

1. Installera backend:
```bash
cd backend
npm install
npm start
```

2. Installera frontend (i nytt terminalfönster):
```bash
cd frontend
npm install
npm run dev
```

3. Öppna http://localhost:5173 i din webbläsare

## Struktur
```
mekkompis/
├── backend/          # Express API server
├── frontend/         # React frontend
├── database/         # SQLite databas
└── uploads/          # Uppladdade bilder
```

## Utveckling
Appen körs lokalt och all data sparas på din dator.

### Utvecklingsverktyg

#### UX-review (`/ux-review`)
Ett Claude Code slash command för att granska appens användarvänlighet.

**Vad det gör:**
- Analyserar frontend-koden automatiskt
- Granskar användbarhet, tillgänglighet och användarflöden
- Ger konkreta förbättringsförslag med prioritering

**Användning:**
```
/ux-review
```

Detta är särskilt användbart efter större UI-ändringar eller innan release av ny version.

## Versionshistorik

### v0.3 (Aktuell)
**UX-förbättringar och användarvänlighet:**
- Toast-notifikationer för alla åtgärder
- Bekräftelsedialoger istället för browser confirm()
- Formulärvalidering (datum, negativa värden)
- Filtrera och sortera jobb
- Bildhantering: lightbox och radera bilder
- Förbättrad tillgänglighet (ARIA, tangentbordsnavigation)
- Loading states och visuell feedback

### v0.2
- Hantera flera motorcyklar
- Kostnadsuppföljning per jobb
- Statistik per motorcykel (total kostnad, antal jobb)
- Klarmarkera jobb
- Antal på inköpslista
- Redigera inköpslista-items

### v0.1
- Grundläggande mek-jobblogg
- Bilder och anteckningar
- Enkel inköpslista

## Framtida features
- Servicereminders baserat på milantal
- Kategorier och taggar för jobb
- Sök i jobb och anteckningar
- Export till PDF
- Inloggning för flera användare
