@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title PUNTO DE VENTA CELULARES - SUBIDA A GITHUB

echo ============================================================
echo  PUNTO DE VENTA CELULARES - SUBIDA AUTOMATICA A GITHUB
echo ============================================================
echo.

PowerShell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0SUBIR_A_GITHUB_AUTOMATICO.ps1"
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if not "%EXIT_CODE%"=="0" (
  echo [ERROR] La subida no termino correctamente.
  echo Revisa SUBIDA_GITHUB_LOG.txt dentro de esta carpeta.
  pause
  exit /b %EXIT_CODE%
)

echo [OK] El proyecto fue subido correctamente.
pause
endlocal
