#!/bin/bash

echo "================================================"
echo "     QuizPortal - MERN Stack Startup"
echo "================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Download from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Install backend deps
echo ""
echo "[1/2] Setting up Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Install frontend deps
echo ""
echo "[2/2] Setting up Frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

cd ..

echo ""
echo "================================================"
echo " Starting servers..."
echo " Backend  → http://localhost:5000"
echo " Frontend → http://localhost:3000"
echo "================================================"
echo ""

# Start backend
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers started!"
echo "📌 Open http://localhost:3000 in your browser"
echo ""
echo "Faculty Login:"
echo "   Username: faculty"
echo "   Password: 1234567890"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'; exit" INT
wait
