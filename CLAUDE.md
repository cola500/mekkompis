# Claude Guide för Mekkompis-projektet

## Om Projektet
Mekkompis är en personlig mek-loggbok för motorcyklar där användare kan dokumentera underhåll, reparationer och modifieringar. Detta är en MVP (Minimum Viable Product) som körs lokalt först, men ska senare kunna deployas till webbhotell.

## Aktuell Status: v0.3
**Implementerade Features:**
- ✅ Hantera flera motorcyklar med märke, modell, år, regnummer, milantal
- ✅ Kostnadsuppföljning per jobb
- ✅ Statistik per motorcykel (total kostnad, antal jobb)
- ✅ Klarmarkera jobb med checkbox
- ✅ Filtrera och sortera jobb (status, datum, kostnad)
- ✅ Inköpslista med antal (t.ex. "Olja (3 st)")
- ✅ Redigera inköpslista-items
- ✅ Ladda upp, visa och radera bilder per jobb
- ✅ Lightbox för fullskärmsvy av bilder
- ✅ Anteckningar och tutorials per jobb
- ✅ Formulärvalidering (datum, negativa värden)
- ✅ Toast-notifikationer för feedback
- ✅ Bekräftelsedialoger för borttagning
- ✅ Förbättrad tillgänglighet (ARIA, tangentbordsnavigation)
- ✅ Loading states

## Projektmål
- **Primärt mål**: Enkel, användbar app för att dokumentera motorcykel-underhåll
- **Sekundärt mål**: Lätt att deploya till befintligt webbhotell (www.inleed.se)
- **Kostnad**: Håll det billigt - använd gratis/enkla lösningar
- **Komplexitet**: Håll det enkelt - detta är en MVP

## Tech Stack
- **Frontend**: React + Vite + Vanilla CSS
- **Backend**: Node.js + Express
- **Databas**: SQLite (lokalt), uppgraderbar till MySQL/PostgreSQL för produktion
- **Filuppladdning**: Multer v2.0
- **API**: REST med JSON

## Projektstruktur
```
mekkompis/
├── backend/          # Express API server
│   ├── src/
│   │   ├── server.js    # Huvudserver
│   │   ├── db.js        # Databas-setup och queries
│   │   └── routes.js    # API endpoints
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── App.jsx      # Huvudkomponent
│   │   └── App.css      # Styling
│   └── package.json
├── database/         # SQLite databas (git-ignorerad)
├── uploads/          # Uppladdade bilder (git-ignorerad)
├── README.md         # Projektdokumentation
└── CLAUDE.md         # Denna fil

```

## Viktiga Regler för Utveckling

### Dokumentation
- **README.md SKA ALLTID UPPDATERAS** när funktionalitet läggs till eller ändras
- Uppdatera "Funktioner (MVP)"-sektionen när nya features läggs till
- Håll Tech Stack-sektionen synkad med verkliga dependencies
- Om du lägger till nya npm-paket, dokumentera dem i README

### Databas
- Använd alltid prepared statements (finns i `db.js`)
- Vid schema-ändringar: dokumentera dem och förklara migration-behovet
- SQLite har begränsningar - tänk på framtida MySQL/PostgreSQL-migration

### API Design
- Följ RESTful-principer
- Returnera alltid JSON
- Använd rätt HTTP-statuskoder (200, 201, 400, 404, 500)
- Svenska felmeddelanden för användaren, engelska i console.error()

### Frontend
- Håll komponenter enkla - en stor App.jsx är okej för MVP
- CSS: använd BEM-liknande naming (job-section, job-header, etc)
- Ingen onödig abstraktion - YAGNI (You Ain't Gonna Need It)
- Använd svenska i UI-texter

### Error Handling
- Alltid try-catch på async-funktioner
- Logga fel i konsolen för debugging
- Visa användarvänliga meddelanden (på svenska) till användaren
- Hantera edge cases (tomma listor, misslyckade uppladdningar, etc)

### Kodstil
- Använd ES6+ features (arrow functions, destructuring, async/await)
- Kommentarer på engelska i koden
- Svenska i användarmeddelanden
- Konsekvent indentation (2 spaces)

## Framtida Features (Ej implementerat ännu)
- Servicereminders baserat på milantal
- Inloggning/autentisering
- Flera användare
- Kategorier och taggar för jobb
- Sök och filtrering
- Export till PDF

## Deployment-plan (Framtida)
1. Byt från SQLite till MySQL
2. Konfigurera environment variables (.env)
3. Bygg frontend (`npm run build`)
4. Deploya till www.inleed.se
5. Konfigurera Node.js på webbhotellet

## Kända Begränsningar
- Ingen autentisering - alla kan se och ändra allt (okej för MVP)
- Bilder sparas lokalt - inte optimerade för produktion
- Ingen backup-strategi än
- SQLite stödjer inte samtidiga skrivningar väl

## När du gör ändringar
1. **Testa lokalt** - starta både backend och frontend
2. **Uppdatera README.md** om funktionalitet ändras
3. **Förklara tekniska val** - hjälp användaren förstå varför
4. **Håll det enkelt** - ingen premature optimization

## Användarens Preferenser
- Vill lära sig - ge kortfattade förklaringar av nya koncept
- Svenska i kommunikation, men tekniska termer kan vara på engelska
- Gillar lättsamt och trevligt samarbete
- Föredrar att få en fråga i taget vid osäkerhet

## Claude-verktyg

### UX-review (`/ux-review`)
Ett specialiserat slash command för att granska appens användarvänlighet och UX.

**Vad det gör:**
- Analyserar frontend-koden (App.jsx och App.css)
- Granskar användbarhet, tillgänglighet och användarflöden
- Identifierar UX-problem och ger konkreta förbättringsförslag
- Prioriterar problem: 🔴 Kritiskt | 🟡 Viktigt | 🟢 Nice-to-have

**När ska du använda det:**
- Efter större UI-ändringar
- Innan release av ny version
- När du vill få en andra åsikt om användarupplevelsen
- För att identifiera tillgänglighetsproblem

**Hur:**
```
/ux-review
```

Agenten läser automatiskt frontend-koden och ger en strukturerad rapport med prioriterade rekommendationer.

## Debugging
- Backend körs på: http://localhost:3000
- Frontend körs på: http://localhost:5173
- Bilder serveras från: http://localhost:3000/uploads
- Databas: `database/mekkompis.db`
- Loggar: Kolla terminal där backend/frontend körs

## Vanliga Problem & Lösningar

### "Table has no column named X"
- Databasen behöver uppdateras efter schema-ändringar
- Lösning: Ta bort `database/mekkompis.db` och starta om backend

### Bilder visas inte
- Kontrollera att uploads-mappen finns
- Kolla att backend serverar `/uploads`-route
- Verifiera filnamn i databasen matchar filer på disk

### CORS-errors
- Backend kör CORS middleware
- Frontend måste använda rätt API_URL (http://localhost:3000/api)

## Git Commit-meddelanden
Använd svenska och var koncis:
- "Lägg till milantal-fält i mek-jobb"
- "Fixa centrering av delete-knapp i inköpslista"
- "Uppdatera README med nya funktioner"

## Best Practices

### Säkerhet
- **Aldrig hardcoda secrets** - använd environment variables (.env)
- **Validera all input** - både på frontend och backend
- **Sanitera användarinput** - förhindra SQL injection (använd prepared statements)
- **Begränsa filuppladdningar** - storlek, filtyp, antal
- **HTTPS i produktion** - aldrig skicka känslig data över HTTP

### Performance
- **Lazy loading av bilder** - ladda bara när de syns
- **Begränsa databasfrågor** - hämta bara vad som behövs
- **Indexera databas-kolumner** - för snabbare sökningar (när du migrerar till MySQL)
- **Komprimera bilder** - innan uppladdning eller efter mottagning
- **Använd pagination** - när listan blir lång

### Kodkvalitet
- **DRY (Don't Repeat Yourself)** - men inte för tidigt! Vänta tills du ser mönster
- **KISS (Keep It Simple, Stupid)** - enkel kod är lättare att underhålla
- **YAGNI (You Ain't Gonna Need It)** - bygg inte features "för framtiden"
- **Självförklarande kod** - namn ska beskriva vad saker gör
- **Kommentarer** - förklara "varför", inte "vad" (koden visar vad)

### React Best Practices
- **Ett ansvar per komponent** - när App.jsx blir för stor, dela upp
- **Lyft state upp** - håll state där det behövs, inte högre
- **useEffect cleanup** - städa upp event listeners, timers, etc
- **Keys i listor** - använd unika ID:n, inte array-index
- **Kontrollerade formulär** - state är source of truth

### API Best Practices
- **Versionshantera API:et** - `/api/v1/jobs` när det behövs
- **Konsekvent naming** - plural för collections (`/jobs`), singular för item (`/jobs/:id`)
- **Använd rätt HTTP-metoder**:
  - GET - hämta data
  - POST - skapa ny resurs
  - PUT - uppdatera hel resurs
  - PATCH - partiell uppdatering
  - DELETE - ta bort resurs
- **Returnera rätt statuskoder**:
  - 200 OK - lyckad GET/PUT/PATCH
  - 201 Created - lyckad POST
  - 204 No Content - lyckad DELETE
  - 400 Bad Request - felaktig input
  - 404 Not Found - resursen finns inte
  - 500 Internal Server Error - serverfel

### Databas Best Practices
- **Normalisera data** - undvik duplicerad data
- **Foreign keys** - säkerställ dataintegritet
- **Transactions** - för operationer som måste lyckas tillsammans
- **Backup-strategi** - regelbundna backups i produktion
- **Migration-strategi** - dokumentera schema-ändringar

### Testning (För framtiden)
- **Enhetstester** - för kritisk business logic
- **Integrationstester** - för API endpoints
- **E2E-tester** - för viktiga user flows
- **Testa edge cases** - tomma listor, stora filer, långa strängar

### Accessibility (A11y)
- **Semantisk HTML** - använd rätt element (button, input, etc)
- **Alt-text på bilder** - beskriv vad bilden visar
- **Keyboard navigation** - allt ska gå att nå med Tab
- **Tydliga labels** - alla formulärfält ska ha labels
- **Färgkontrast** - text ska vara läsbar

### Miljövariabler (.env)
När du är redo för produktion, skapa `.env` för:
```
# Backend
PORT=3000
DATABASE_URL=mysql://user:pass@host/db
UPLOAD_DIR=/path/to/uploads
MAX_FILE_SIZE=10485760

# Frontend
VITE_API_URL=https://api.mekkompis.se
```

### Monitoring & Logging (Produktion)
- **Logga viktiga händelser** - inloggningar, fel, viktiga operationer
- **Använd log-nivåer** - error, warn, info, debug
- **Spara loggar** - rotera och arkivera
- **Monitoring** - övervaka server-hälsa, svarstider
- **Error tracking** - t.ex. Sentry för att fånga produktionsfel

### Backup-strategi (Produktion)
- **Dagliga databas-backups** - automatiserade
- **Testa återställning** - backup är värdelös om den inte går att återställa
- **Offsite backup** - för katastrofåterställning
- **Versionshantering av bilder** - S3, Cloudinary eller liknande

---

**Sist uppdaterad**: 2025-11-07
**Version**: 0.3.0 (MVP)
