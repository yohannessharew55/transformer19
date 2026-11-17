@echo off
title Transformer19 - Trading Execution Cockpit
echo ========================================================
echo    TRANSFORMER19 - TRADING EXECUTION COCKPIT
echo ========================================================
echo Starting local server on http://localhost:3001 ...
start http://localhost:3001
call npm.cmd run dev
pause
