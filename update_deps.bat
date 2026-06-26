@echo off
title YT-DLP Userscript — Update Dependencies
echo.
echo  Updating yt-dlp and ffmpeg to latest versions...
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python 3 not found. Install from https://www.python.org
    pause
    exit /b 1
)

python "%~dp0download_deps.py" --force

echo.
pause
