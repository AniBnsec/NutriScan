@echo off
echo ============================================
echo   AI Portion & Nutrition Scanner Setup
echo ============================================
echo.

echo [1/4] Installing Server dependencies...
cd /d "%~dp0server"
call npm install
if errorlevel 1 (
  echo ERROR: Server npm install failed!
  pause
  exit /b 1
)
echo Server dependencies installed OK!
echo.

echo [2/4] Installing Client dependencies...
cd /d "%~dp0client"
call npm install
if errorlevel 1 (
  echo ERROR: Client npm install failed!
  pause
  exit /b 1
)
echo Client dependencies installed OK!
echo.

echo [3/4] Setup complete!
echo.
echo ============================================
echo   HOW TO RUN THE APP
echo ============================================
echo.
echo IMPORTANT: Make sure MongoDB is running first!
echo   Option A: Run 'mongod' in a separate terminal
echo   Option B: Use MongoDB Compass
echo.
echo Then open TWO separate terminals:
echo.
echo Terminal 1 - Start Backend:
echo   cd "%~dp0server"
echo   npm run dev
echo.
echo Terminal 2 - Start Frontend:
echo   cd "%~dp0client"
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo ============================================
echo.
pause
