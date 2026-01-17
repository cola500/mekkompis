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

**Säkerhet**
- JWT-autentisering (optional, aktiveras i produktion)
- CORS-skydd - begränsar tillåtna origins
- Path traversal-skydd i file uploads
- Saniterade filnamn
- Prepared statements för databas-queries (SQL injection-skydd)
- React's auto-escaping (XSS-skydd)

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

### Snabbstart (rekommenderat)

**Starta appen:**
```bash
./start.sh
```

Detta script:
- Installerar automatiskt dependencies om de saknas
- Startar backend (http://localhost:3000)
- Startar frontend (http://localhost:5173)
- Kan stoppas med Ctrl+C

**Stoppa appen:**
```bash
./stop.sh
```

### Manuell installation (alternativ)

Om du föredrar att starta backend och frontend separat:

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

## Projekt i detta repo

Detta repository innehåller två separata projekt:

### 1. Mekkompis (huvudprojekt)
En personlig mek-loggbok för motorcyklar. Se instruktioner nedan.

### 2. Busschema-app
En Västtrafik busstider-app för Raspberry Pi med pekskärm.
- **Plats:** `/busschema-app/`
- **Dokumentation:** Se `busschema-app/README.md`
- **Snabbstart:** Se `busschema-app/QUICKSTART.md`

## Struktur (Mekkompis)
```
mekkompis/
├── backend/          # Express API server
├── frontend/         # React frontend
├── database/         # SQLite databas
├── uploads/          # Uppladdade bilder
└── busschema-app/    # Separat projekt (Västtrafik busstider)
```

## Utveckling
Appen körs lokalt och all data sparas på din dator.

## Deployment till Inleed.se

> **⚠️ OBS:** Denna deployment-guide är inte testad i produktion ännu. Använd den som utgångspunkt och var beredd på att behöva göra justeringar baserat på din specifika hosting-miljö.

Mekkompis kan deployas till Inleed.se (eller liknande webbhotell med Node.js-stöd). Här är stegen:

### Förberedelser

**1. Val av hosting:**
- **VPS** (rekommenderas): Full kontroll, enklare setup för Node.js
- **Webbhotell**: Billigare, men kan kräva anpassningar beroende på paket

**2. Krav på servern:**
- Node.js v18+ installerat
- MySQL eller PostgreSQL databas
- SSL-certifikat (Let's Encrypt ingår hos Inleed)
- Minst 512 MB RAM (1 GB+ rekommenderas)

### Steg-för-steg deployment

#### 1. Förbered databasen
```bash
# Logga in på din Inleed MySQL-databas via DirectAdmin/phpMyAdmin
# Kör följande SQL för att skapa tabeller:

CREATE TABLE motorcycles (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  registration_number TEXT,
  current_mileage INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  motorcycle_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  mileage INTEGER,
  cost DECIMAL(10,2),
  completed TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE
);

CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  job_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  job_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE shopping_items (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  job_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  purchased TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
```

#### 2. Konfigurera environment variables
Skapa en `.env` fil i backend-mappen på servern:

```bash
# Database (MySQL från Inleed)
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=ditt_db_användarnamn
DB_PASSWORD=ditt_db_lösenord
DB_NAME=ditt_db_namn

# Server
PORT=3000
NODE_ENV=production

# Paths
UPLOAD_DIR=/path/to/uploads

# CORS - Dina domäner (komma-separerade)
ALLOWED_ORIGINS=https://mekkompis.inleed.se,https://www.mekkompis.inleed.se

# Autentisering (VIKTIGT för säkerhet i produktion!)
# Generera JWT secret:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=din_jwt_secret_här

# Generera lösenordshash:
# node backend/hash-password.js DittLösenordHär
AUTH_PASSWORD_HASH=din_bcrypt_hash_här
```

**Viktigt:** Generera starka secrets och lösenord! Se stegen i kommentarerna ovan.

#### 3. Uppdatera backend för MySQL
Modifiera `backend/src/db.js` för att stödja MySQL:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

let db;

if (process.env.DB_TYPE === 'mysql') {
  // MySQL connection pool
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  // SQLite for local development (befintlig kod)
  // ...
}

module.exports = db;
```

#### 4. Bygg frontend
```bash
cd frontend
npm run build
# Detta skapar en dist-mapp med optimerade filer
```

#### 5. Ladda upp till servern
```bash
# Via SFTP/SCP eller DirectAdmin File Manager:
# - Ladda upp hela backend-mappen
# - Ladda upp frontend/dist-mappen
# - Skapa uploads-mappen med skrivrättigheter
```

#### 6. Installera dependencies på servern
```bash
ssh ditt-användarnamn@inleed.se
cd ~/mekkompis/backend
npm install --production
```

#### 7. Konfigurera webbserver

**För VPS med egen webbserver:**
Lägg till en reverse proxy i Nginx/Apache som pekar till Node.js-appen:

```nginx
# Nginx exempel
server {
    listen 80;
    server_name mekkompis.inleed.se;

    # Frontend (statiska filer)
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uppladdade bilder
    location /uploads {
        alias /path/to/uploads;
    }
}
```

#### 8. Starta appen
```bash
# Med PM2 (process manager, rekommenderas)
npm install -g pm2
pm2 start backend/src/server.js --name mekkompis
pm2 save
pm2 startup

# Eller med systemd service
# Skapa /etc/systemd/system/mekkompis.service
```

#### 9. SSL-certifikat
```bash
# Använd Let's Encrypt (ingår i Inleed)
# Via DirectAdmin eller manuellt med certbot
certbot --nginx -d mekkompis.inleed.se
```

### Viktiga ändringar för produktion

**Backend:**
- ✅ Byt från SQLite till MySQL
- ✅ Lägg till .env för känsliga uppgifter
- ✅ Sätt `NODE_ENV=production`
- ✅ Konfigurera CORS för rätt domän
- ✅ Lägg till rate limiting
- ✅ Sätt upp loggning (Winston eller liknande)

**Frontend:**
- ✅ Uppdatera `API_URL` till produktions-URL
- ✅ Kör `npm run build`
- ✅ Testa att alla länkar fungerar

**Säkerhet:**
- ✅ Använd HTTPS (SSL-cert)
- ✅ Sätt starka databas-lösenord
- ✅ Begränsa filuppladdningar (storlek, typ)
- ✅ Sätt upp firewall-regler
- ✅ Regelbundna backups av databas och uploads

### Underhåll

**Backup:**
```bash
# Automatisk backup av MySQL
mysqldump -u user -p db_name > backup_$(date +%Y%m%d).sql

# Backup av uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /path/to/uploads
```

**Uppdateringar:**
```bash
# Pull senaste ändringar från GitHub
cd ~/mekkompis
git pull origin main

# Bygg frontend
cd frontend && npm run build

# Restart backend
pm2 restart mekkompis
```

### Kostnad (uppskattning)
- **VPS Basic hos Inleed**: ~100-200 kr/mån
- **Webbhotell Prime**: ~60-150 kr/mån (om Node.js stöds)
- **Domän**: Inkluderad eller separat kostnad

### Support
Om du stöter på problem, kontakta Inleed support för:
- Node.js-installation och konfiguration
- Databasåtkomst och inställningar
- SSL-certifikat setup
- Firewall och säkerhetsinställningar

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

#### Security-review (`/security-review`)
Ett Claude Code slash command för att granska appens säkerhet inför deployment.

**Vad det gör:**
- Analyserar både backend och frontend för säkerhetsbrister
- Kollar mot OWASP Top 10
- Identifierar SQL injection, XSS, CSRF och andra sårbarheter
- Granskar file upload security, authentication och API-säkerhet
- Ger prioriterade rekommendationer med kod-exempel

**Användning:**
```
/security-review
```

**VIKTIGT:** Kör alltid denna innan du deployer appen till produktion!

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

**Säkerhetsförbättringar:**
- JWT-autentisering (optional för lokal utveckling)
- CORS-konfiguration - begränsar tillåtna origins
- Path traversal-skydd i file uploads
- Saniterade filnamn för uppladdningar
- Prepared statements (SQL injection-skydd)
- Helper script för lösenordsgenerering

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
