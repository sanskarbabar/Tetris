@echo off
title Tetris DSA Edition
echo ==============================================
echo   Starting Tetris DSA Edition (Full-Stack)
echo ==============================================
echo.

echo Starting Backend Server on port 5000...
start "Tetris Backend" cmd /k "cd server && npm start"

timeout /t 2 /nobreak >nul

echo Starting Frontend Web App on port 5173...
start "Tetris Frontend" cmd /k "cd client && npm run dev"

timeout /t 2 /nobreak >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ==============================================
echo   Tetris is running! Keep the windows open.
echo ==============================================
pause

