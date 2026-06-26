@echo off
title YT-DLP Userscript Server (http://127.0.0.1:6554)

python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python 3 is NOT installed or not in PATH.
    echo  Download from https://www.python.org  and tick "Add to PATH".
    pause
    exit /b 1
)

python "%~dp0native_server\ytdl_server.py"

pause
