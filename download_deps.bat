@echo off
title YT-DLP Userscript — Download Dependencies
echo.

REM ── check Python ──
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python 3 is NOT installed or not in PATH.
    echo.
    echo  Download from: https://www.python.org/downloads/
    echo  IMPORTANT: Check "Add Python to PATH" during install!
    echo.
    pause
    exit /b 1
)

REM ── run the downloader ──
python "%~dp0download_deps.py" %*

echo.
pause
