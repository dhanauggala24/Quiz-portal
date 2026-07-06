@echo off
echo ================================================
echo   QuizPortal - LAN Mode (70 Students Setup)
echo ================================================
echo.
echo This mode serves everything from ONE port (5000)
echo so all students can connect via your network IP.
echo.

echo [1/4] Installing Backend dependencies...
cd backend
if not exist node_modules (
    call npm install
)

echo.
echo [2/4] Installing Frontend dependencies...
cd ..\frontend
if not exist node_modules (
    call npm install
)

echo.
echo [3/4] Building Frontend for production...
call npm run build

echo.
echo [4/4] Starting server (backend + frontend combined)...
cd ..\backend

echo.
echo ================================================
echo  Server starting...
echo  Share the NETWORK URL shown below with students
echo ================================================
echo.

npm start
