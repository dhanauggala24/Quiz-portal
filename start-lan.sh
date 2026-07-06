#!/bin/bash

echo "================================================"
echo "  QuizPortal - LAN Mode (70 Students Setup)"
echo "================================================"
echo ""
echo "Serves everything from ONE port so students"
echo "can connect using your network IP."
echo ""

echo "[1/4] Installing Backend dependencies..."
cd backend
[ ! -d "node_modules" ] && npm install
cd ..

echo ""
echo "[2/4] Installing Frontend dependencies..."
cd frontend
[ ! -d "node_modules" ] && npm install

echo ""
echo "[3/4] Building Frontend for production..."
npm run build
cd ..

echo ""
echo "[4/4] Starting combined server..."
echo ""
echo "================================================"
echo " Share the NETWORK URL below with students"
echo "================================================"
echo ""

cd backend
npm start
