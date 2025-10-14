@echo off
echo Starting Auto Cron Job...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if auto-cron.js exists
if not exist "auto-cron.js" (
    echo Error: auto-cron.js not found
    pause
    exit /b 1
)

REM Start auto-cron.js
echo Starting auto-cron.js...
node auto-cron.js

pause
