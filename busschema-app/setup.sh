#!/bin/bash

echo "🚌 Busschema-app Setup"
echo "====================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js är inte installerat"
  echo "📥 Installera från: https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js $(node --version) hittades"

# Install backend dependencies
echo ""
echo "📦 Installerar backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
  echo "❌ Backend installation misslyckades"
  exit 1
fi
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installerar frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
  echo "❌ Frontend installation misslyckades"
  exit 1
fi
cd ..

# Setup .env
echo ""
if [ ! -f backend/.env ]; then
  echo "📝 Skapar .env fil..."
  cp backend/.env.example backend/.env
  echo "⚠️  VIKTIGT: Redigera backend/.env och lägg till dina Västtrafik API-nycklar!"
  echo ""
  echo "   1. Gå till: https://developer.vasttrafik.se/"
  echo "   2. Skapa konto och ny app"
  echo "   3. Prenumerera på 'API Planera Resa v4'"
  echo "   4. Kopiera Client ID och Client Secret till backend/.env"
  echo ""
else
  echo "✅ .env fil finns redan"
fi

# Make scripts executable
chmod +x start-dev.sh

echo ""
echo "✅ Setup klar!"
echo ""
echo "📚 Nästa steg:"
echo "   1. Lägg till API-nycklar i backend/.env"
echo "   2. Kör: ./start-dev.sh"
echo "   3. Öppna: http://localhost:5173"
echo ""
