@echo off
title Transformer19 — 100K Trading Execution Cockpit
color 0B
echo ===============================================================================
echo      TRANSFORMER19 — 100K TRADING EXECUTION COCKPIT (WINDOWS DESKTOP)
echo         48-Week Master Compounding Framework ^| Rule 01 ^& Rule 05 Enforced
echo ===============================================================================
echo.
cd /d "%~dp0"
echo [*] Checking runtime environment...
echo [*] Starting Transformer19 Cockpit Native Windows Frame (1440x920)...
echo [*] Connecting to high-performance local SQLite database engine (cockpit.db)...
echo.

node node_modules\electron\cli.js electron\main.cjs

if %errorlevel% neq 0 (
    echo.
    echo [!] Cockpit closed or encountered an issue.
    pause
)
