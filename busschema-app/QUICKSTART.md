# 🚀 Quickstart Guide

## Snabbstart (5 minuter)

### 1. Skaffa API-nycklar

1. Gå till **[developer.vasttrafik.se](https://developer.vasttrafik.se/)**
2. Skapa konto → Logga in
3. Skapa en ny app (valfritt namn, t.ex. "Busschema")
4. Prenumerera på **"API Planera Resa v4"**
5. Kopiera ditt **Client ID** och **Client Secret**

### 2. Installera och konfigurera

```bash
# Kör setup-script
./setup.sh

# Redigera .env och lägg till dina API-nycklar
nano backend/.env
```

I `.env`, ändra:
```
VASTTRAFIK_CLIENT_ID=ditt_client_id_här
VASTTRAFIK_CLIENT_SECRET=ditt_client_secret_här
```

### 3. Starta appen

```bash
# Enkelt: kör både backend och frontend
./start-dev.sh
```

Eller manuellt:

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Öppna i webbläsare

Gå till: **http://localhost:5173**

## Testa appen

1. Sökfältet visar "Betaniagatan" automatiskt
2. Klicka på hållplatsen i resultaten
3. Se realtidsavgångar!
4. Avgångar uppdateras automatiskt var 30:e sekund

## Nästa steg

- **Testa på din dator först** innan du sätter upp Raspberry Pi
- **Läs README.md** för fullständiga instruktioner om Raspberry Pi-deployment
- **Anpassa hållplatsen** genom att söka på valfri hållplats

## Felsökning

**"Failed to get access token"**
- Kontrollera att API-nycklarna är korrekta i `backend/.env`

**"Cannot connect to backend"**
- Se till att backend körs på http://localhost:3001
- Kolla terminalen för felmeddelanden

**"Inga avgångar just nu"**
- Testa en annan hållplats
- Kontrollera att du valt rätt hållplats från sökresultaten

## Support

- Västtrafik API-dokumentation: https://developer.vasttrafik.se/portal/guides
- Problem med API: developer@vasttrafik.se

---

**Lycka till! 🚌**
