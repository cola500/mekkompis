#!/bin/bash

# Start Mekkompis app - both backend and frontend

echo "🏍️  Startar Mekkompis..."
echo ""

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installerar backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installerar frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "🚀 Startar backend (http://localhost:3000)..."
(cd backend && npm run dev) &
BACKEND_PID=$!

echo "🚀 Startar frontend (http://localhost:5173)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✅ Mekkompis är igång!"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Tryck Ctrl+C för att stoppa båda servrarna"

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stoppar servrar...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
