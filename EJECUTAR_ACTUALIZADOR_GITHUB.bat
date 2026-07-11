@echo off
setlocal EnableExtensions
chcp 65001 >nul
title LINOEM - COMPILAR Y ACTUALIZAR GITHUB
color 0B

cd /d "%~dp0"

echo ============================================================
echo  LINOEM DEVELOPMENT
echo  PUNTO DE VENTA CELULARES - ENTREGA COMPLETA
echo ============================================================
echo.

where py >nul 2>&1
if %errorlevel%==0 (
    py -3 "%~dp0ACTUALIZAR_GITHUB_COMPILAR.py"
    set "RESULTADO=%errorlevel%"
    goto :FIN
)

where python >nul 2>&1
if %errorlevel%==0 (
    python "%~dp0ACTUALIZAR_GITHUB_COMPILAR.py"
    set "RESULTADO=%errorlevel%"
    goto :FIN
)

echo [ERROR] No se encontro Python 3.
echo Instala Python y activa la opcion Add Python to PATH.
set "RESULTADO=1"

:FIN
echo.
if "%RESULTADO%"=="0" (
    echo [OK] Proceso terminado correctamente.
) else (
    echo [ERROR] El proceso termino con errores.
    echo Revisa ACTUALIZACION_GITHUB_LOG.txt dentro del proyecto.
)
echo.
pause
exit /b %RESULTADO%
