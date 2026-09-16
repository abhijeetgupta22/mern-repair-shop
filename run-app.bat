@echo off
title TechFix Pro Care MERN Stack Platform
echo ===================================================
echo   Starting TechFix Pro Care (MERN Stack)
echo ===================================================
echo.

cd /d "%~dp0server"
echo [1/2] Starting Backend Server (Port 5000)...
start "TechFix Backend Server (Port 5000)" cmd /k "node server.js"

timeout /t 2 /nobreak >nul

cd /d "%~dp0client"
echo [2/2] Starting Frontend Client (Port 5173)...
start "TechFix Frontend Vite (Port 5173)" cmd /k "npm run dev"

echo.
echo Both servers started!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000/api
echo.
pause
