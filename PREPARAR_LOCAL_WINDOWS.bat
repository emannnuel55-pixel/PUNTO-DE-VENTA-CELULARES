@echo off
cd /d "%~dp0"
PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0PREPARAR_LOCAL_WINDOWS.ps1"
if errorlevel 1 pause
