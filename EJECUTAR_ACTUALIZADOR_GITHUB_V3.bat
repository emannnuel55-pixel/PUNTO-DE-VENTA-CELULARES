@echo off
setlocal EnableExtensions
chcp 65001 >nul
title LINOEM - CORREGIR Y ACTUALIZAR GITHUB V3
color 0B

cd /d "%~dp0"

echo ============================================================
echo  LINOEM DEVELOPMENT
echo  CORREGIR, COMPILAR Y ACTUALIZAR GITHUB V3
echo ============================================================
echo.

set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se encontro node.exe.
    echo Repara Node.js 22 LTS.
    pause
    exit /b 1
)

if not exist "C:\Program Files\nodejs\npm.cmd" (
    where npm.cmd >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] No se encontro npm.cmd.
        echo Repara la instalacion de Node.js 22 LTS.
        pause
        exit /b 2
    )
)

where py >nul 2>&1
if %errorlevel%==0 (
    py -3 "%~dp0ACTUALIZAR_GITHUB_COMPILAR_V2.py" --project "%~dp0"
    set "RESULTADO=%errorlevel%"
    goto :FIN
)

where python >nul 2>&1
if %errorlevel%==0 (
    python "%~dp0ACTUALIZAR_GITHUB_COMPILAR_V2.py" --project "%~dp0"
    set "RESULTADO=%errorlevel%"
    goto :FIN
)

echo [ERROR] No se encontro Python 3.
echo Instala Python y activa Add Python to PATH.
set "RESULTADO=1"

:FIN
echo.
if "%RESULTADO%"=="0" (
    echo [OK] Proceso terminado correctamente.
) else (
    echo [ERROR] El proceso termino con errores.
    echo Revisa ACTUALIZACION_GITHUB_V3_LOG.txt.
)
echo.
pause
exit /b %RESULTADO%
