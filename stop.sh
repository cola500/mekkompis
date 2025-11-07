#!/bin/bash

# Stop Mekkompis app - both backend and frontend

echo "🛑 Stoppar Mekkompis..."
echo ""

# Find and kill backend (port 3000)
BACKEND_PID=$(lsof -ti:3000)
if [ ! -z "$BACKEND_PID" ]; then
    echo "🔴 Stoppar backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
    echo "   ✅ Backend stoppad"
else
    echo "   ℹ️  Backend körs inte"
fi

# Find and kill frontend (port 5173)
FRONTEND_PID=$(lsof -ti:5173)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "🔴 Stoppar frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID
    echo "   ✅ Frontend stoppad"
else
    echo "   ℹ️  Frontend körs inte"
fi

echo ""
echo "✅ Klart!"
