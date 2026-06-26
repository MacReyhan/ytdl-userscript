@echo off
title YT-DLP Userscript — Setup & Installation
echo.
echo  ════════════════════════════════════════════════════════════
echo   YT Video Downloader Userscript — Setup & Dependency Install
echo  ════════════════════════════════════════════════════════════
echo.

REM ── check Python ──
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python 3 is NOT installed or not in PATH.
    echo  Download from https://www.python.org  and tick "Add to PATH".
    pause
    exit /b 1
)

REM ══════════════════════════════════════════════
REM  STEP 1 — Download dependencies
REM ══════════════════════════════════════════════
echo.
echo  ┌────────────────────────────────────┐
echo  │  STEP 1: Download dependencies     │
echo  └────────────────────────────────────┘
echo.

set SKIP_DL=0
if exist "%~dp0native_server\yt-dlp.exe" (
    if exist "%~dp0native_server\ffmpeg.exe" (
        if exist "%~dp0native_server\ffprobe.exe" (
            echo  All dependencies already exist.
            set /p REDOWNLOAD="  Re-download anyway? (y/N): "
            if /i "%REDOWNLOAD%"=="y" (
                python "%~dp0download_deps.py" --force
            ) else (
                echo  Skipping download.
                set SKIP_DL=1
            )
        )
    )
)

if %SKIP_DL%==0 (
    if not exist "%~dp0native_server\yt-dlp.exe" (
        python "%~dp0download_deps.py"
    )
    if not exist "%~dp0native_server\ffmpeg.exe" (
        python "%~dp0download_deps.py"
    )
)

REM ── verify ──
if not exist "%~dp0native_server\yt-dlp.exe" (
    echo.
    echo  [ERROR] yt-dlp.exe still not found!
    pause
    exit /b 1
)
if not exist "%~dp0native_server\ffmpeg.exe" (
    echo.
    echo  [ERROR] ffmpeg.exe still not found!
    pause
    exit /b 1
)

REM ══════════════════════════════════════════════
REM  STEP 2 — Install Userscript in Browser
REM ══════════════════════════════════════════════
echo.
echo  ┌───────────────────────────────────────────────┐
echo  │  STEP 2: Install Userscript in Browser        │
echo  └───────────────────────────────────────────────┘
echo.
echo   1. Make sure you have Tampermonkey or Violentmonkey installed in your browser.
echo   2. Open Tampermonkey / Violentmonkey dashboard and click "Create a new script".
echo   3. Copy and paste the entire contents of:
echo      "%~dp0yt-downloader.user.js"
echo   4. Save the script in Tampermonkey / Violentmonkey.
echo.

REM ══════════════════════════════════════════════
REM  STEP 3 — Start Local Server
REM ══════════════════════════════════════════════
echo.
echo  ┌───────────────────────────────────────────────┐
echo  │  STEP 3: Start Local Userscript Server        │
echo  └───────────────────────────────────────────────┘
echo.
echo   To download videos, the local server needs to be running.
echo   You can start it at any time by double-clicking:
echo      run_server.bat
echo.
echo  ════════════════════════════════════════════════════════════
echo   SETUP COMPLETE!
echo  ════════════════════════════════════════════════════════════
echo.
set /p START_NOW="  Would you like to start the server now? (Y/n): "
if /i "%START_NOW%"=="n" (
    exit /b 0
) else (
    start "" "%~dp0run_server.bat"
)
