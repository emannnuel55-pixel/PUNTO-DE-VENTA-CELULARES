@echo off
chcp 65001 >nul
title PUNTO DE VENTA CELULARES - GENERADOR DE PORTALES
color 0B

echo ============================================================
echo  PUNTO DE VENTA CELULARES
echo  GENERADOR, VALIDACION, COMPILACION Y SUBIDA
echo ============================================================
echo.

cd /d "%~dp0"

if not exist "package.json" (
    echo [ERROR] Este archivo debe estar dentro de la carpeta principal
    echo del proyecto, en la misma ubicacion que package.json.
    echo.
    echo Copia estos dos archivos dentro de:
    echo punto-de-venta-celulares
    echo.
    pause
    exit /b 1
)

where py >nul 2>&1
if %errorlevel%==0 (
    py -3 "%~dp0GENERAR_PORTALES_COMPILAR_Y_SUBIR.py" --project "%~dp0"
    set "RESULTADO=%errorlevel%"
    goto :FIN
)

where python >nul 2>&1
if %errorlevel%==0 (
    python "%~dp0GENERAR_PORTALES_COMPILAR_Y_SUBIR.py" --project "%~dp0"
    set "RESULTADO=%errorlevel%"
    goto :FIN
)

echo [ERROR] No se encontro Python 3.
echo Instala Python y activa la opcion "Add Python to PATH".
set "RESULTADO=1"

:FIN
echo.
if "%RESULTADO%"=="0" (
    echo [OK] El generador termino correctamente.
) else (
    echo [ERROR] El generador termino con errores.
    echo Revisa GENERADOR_PORTALES_LOG.txt.
)
echo.
pause
exit /b %RESULTADO%
