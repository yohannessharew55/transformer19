@echo off
title Build Transformer19 Windows Desktop Application
color 0A
echo ===============================================================================
echo        TRANSFORMER19 — BUILD WINDOWS INSTALLER & PORTABLE APPLICATION
echo ===============================================================================
echo.
cd /d "%~dp0"

echo [*] Step 1 of 2: Compiling production client assets and API bundle...
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Production frontend/backend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [*] Step 2 of 2: Packaging Windows application with electron-builder...
call npx.cmd electron-builder --win --x64
if %errorlevel% neq 0 (
    echo [ERROR] Electron packaging failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ===============================================================================
echo [SUCCESS] Windows package built successfully!
echo Executables generated in the release folder:
echo ===============================================================================
dir /b release\*.exe
echo.
pause
