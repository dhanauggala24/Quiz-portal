@echo off
echo ================================================
echo     QuizPortal - MERN Stack Startup
echo ================================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Download from https://nodejs.org
    pause
    exit /b 1
)
echo Node.js found!

echo.
echo [2/3] Installing Backend dependencies...
cd backend
if not exist node_modules (
    call npm install
)

echo.
echo [3/3] Installing Frontend dependencies...
cd ..\frontend
if not exist node_modules (
    call npm install
)

echo.
echo ================================================
echo  Starting servers...
echo  Backend  → http://localhost:5000
echo  Frontend → http://localhost:3000
echo ================================================
echo.

cd ..
start "QuizPortal Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
start "QuizPortal Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Open http://localhost:3000 in your browser.
echo.
echo Faculty Login: username=faculty  password=1234567890
echo.
pause
