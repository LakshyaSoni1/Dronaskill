@echo off
setlocal enabledelayedexpansion

rem ============================================================
rem  Dronaskill launcher
rem  ----------------------------------------------------------
rem  Double-click this to run the site on a real http:// address.
rem  That matters: opened straight from disk the pages have origin
rem  "null" and send no Referer, so YouTube refuses to play the
rem  lecture embeds ("Video player configuration error - 153").
rem  Served over localhost, videos play inside the site.
rem
rem  No install and no build step - it uses Python or Node,
rem  whichever is already on the machine.
rem ============================================================

cd /d "%~dp0"

echo.
echo   Dronaskill
echo   ==========
echo.

rem ---- Pick a port nothing is already listening on --------------
set "PORT="
for %%P in (8000 8001 8080 5500 3000) do (
  if not defined PORT (
    netstat -ano -p tcp | findstr /r /c:"LISTENING" | findstr /c:":%%P " >nul 2>&1
    if errorlevel 1 set "PORT=%%P"
  )
)
if not defined PORT (
  echo   All the usual ports are busy. Close any other local server and retry.
  echo.
  pause
  exit /b 1
)

rem ---- Pick whatever runtime is available -----------------------
set "RUNNER="
where py >nul 2>&1 && set "RUNNER=py -3 -m http.server !PORT!"
if not defined RUNNER where python >nul 2>&1 && set "RUNNER=python -m http.server !PORT!"
if not defined RUNNER where npx >nul 2>&1 && set "RUNNER=npx --yes serve . -l !PORT!"

if not defined RUNNER (
  echo   Couldn't find Python or Node on this computer.
  echo.
  echo   Install Python from https://www.python.org/downloads/
  echo   ^(tick "Add python.exe to PATH" during setup^), then run this again.
  echo.
  pause
  exit /b 1
)

echo   Serving on http://localhost:!PORT!
echo   Opening your browser...
echo.
echo   Close this window to stop the server.
echo.

rem Give the server about a second to bind the socket before the
rem browser makes its first request.
start "" /b cmd /c "ping -n 3 127.0.0.1 >nul&start "" http://localhost:!PORT!/index.html"

rem Run in the foreground so closing this window stops the server.
%RUNNER%

endlocal
