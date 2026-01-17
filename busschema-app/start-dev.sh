#!/bin/bash

# Start both backend and frontend in development mode

echo "🚌 Startar Busschema-app i dev mode..."

# Check if .env exists
if [ ! -f backend/.env ]; then
  echo "❌ Ingen .env fil hittades i backend/"
  echo "📝 Kopiera backend/.env.example till backend/.env och lägg till dina API-nycklar"
  exit 1
fi

# Start backend in background
echo "🔧 Startar backend..."
cd backend
npm install > /dev/null 2>&1
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Startar frontend..."
cd frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Applikationen körs!"
echo "📱 Öppna: http://localhost:5173"
echo "🔌 Backend API: http://localhost:3001/api"
echo ""
echo "🛑 Tryck Ctrl+C för att stoppa..."

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stoppar...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
