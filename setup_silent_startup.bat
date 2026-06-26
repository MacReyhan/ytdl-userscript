@echo off
title YT-DLP Userscript — Silent Background Startup Setup
echo.
echo  ════════════════════════════════════════════════════════════
echo   YT Video Downloader — Silent Startup Setup (No .bat clicks!)
echo  ════════════════════════════════════════════════════════════
echo.
echo  This script will configure the local yt-dlp server to start
echo  completely SILENTLY in the background whenever Windows boots.
echo  You will never have to double-click a .bat file again!
echo.

REM Create shortcut in Windows Startup folder
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set VBS_SCRIPT=%~dp0run_silent.vbs

echo Set oWS = WScript.CreateObject("WScript.Shell") > create_shortcut.vbs
echo sLinkFile = "%STARTUP_DIR%\ytdl_server_silent.lnk" >> create_shortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> create_shortcut.vbs
echo oLink.TargetPath = "wscript.exe" >> create_shortcut.vbs
echo oLink.Arguments = """" ^& "%VBS_SCRIPT%" ^& """" >> create_shortcut.vbs
echo oLink.WorkingDirectory = "%~dp0" >> create_shortcut.vbs
echo oLink.Description = "YT-DLP Userscript Silent Background Server" >> create_shortcut.vbs
echo oLink.Save >> create_shortcut.vbs

cscript /nologo create_shortcut.vbs
del create_shortcut.vbs

echo  [SUCCESS] Silent background task has been added to Windows Startup!
echo.
echo  Starting the server silently right now...
wscript.exe "%VBS_SCRIPT%"
echo.
echo  Done! You can now close this window and use YouTube freely.
echo.
pause
