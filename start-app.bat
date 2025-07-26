@echo off
title NHFarming App Launcher
echo Starting NHFarming Backend and Frontend...
echo.

start "NHFarming Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul
start "NHFarming Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers are starting in separate windows.
echo Backend will be available at: http://localhost:3001
echo Frontend will be available at: http://localhost:3000
echo.
pause 