@echo off
title Actualizar GitHub y Railway - LINOEM
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  py -3 "ACTUALIZAR_GITHUB_RAILWAY.py"
) else (
  python "ACTUALIZAR_GITHUB_RAILWAY.py"
)
if errorlevel 1 pause
