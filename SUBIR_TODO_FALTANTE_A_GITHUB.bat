@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title PUNTO DE VENTA CELULARES - SUBIR TODO A GITHUB
color 0B

rem ============================================================
rem  PUNTO DE VENTA CELULARES
rem  Sube todos los archivos faltantes al repositorio GitHub.
rem  NO instala gh, NO usa winget y NO despliega Railway.
rem ============================================================

set "REPO_URL=https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git"
set "REPO_WEB=https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES"
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR="
set "LOG_NAME=SUBIDA_COMPLETA_GITHUB_LOG.txt"

echo ============================================================
echo  PUNTO DE VENTA CELULARES - SUBIDA COMPLETA A GITHUB
echo ============================================================
echo.

rem ------------------------------------------------------------
rem 1. Localizar la raiz real del proyecto.
rem ------------------------------------------------------------
if exist "%SCRIPT_DIR%package.json" if exist "%SCRIPT_DIR%app" if exist "%SCRIPT_DIR%prisma" (
    set "PROJECT_DIR=%SCRIPT_DIR%"
)

if not defined PROJECT_DIR (
    if exist "%SCRIPT_DIR%punto-de-venta-celulares\package.json" if exist "%SCRIPT_DIR%punto-de-venta-celulares\app" (
        set "PROJECT_DIR=%SCRIPT_DIR%punto-de-venta-celulares"
    )
)

if not defined PROJECT_DIR (
    echo [ERROR] No se encontro la raiz del proyecto.
    echo.
    echo Copia este BAT dentro de la carpeta que contiene:
    echo   package.json
    echo   app
    echo   prisma
    echo   public
    echo   Dockerfile
    echo.
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"
set "LOG=%CD%\%LOG_NAME%"

> "%LOG%" echo ============================================================
>>"%LOG%" echo PUNTO DE VENTA CELULARES - SUBIDA COMPLETA A GITHUB
>>"%LOG%" echo Fecha: %DATE% %TIME%
>>"%LOG%" echo Proyecto: %CD%
>>"%LOG%" echo Destino: %REPO_URL%
>>"%LOG%" echo ============================================================

echo Proyecto: %CD%
echo Destino:  %REPO_URL%
echo Log:      %LOG%
echo.

rem ------------------------------------------------------------
rem 2. Verificaciones principales.
rem ------------------------------------------------------------
where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git no esta instalado o no esta disponible en PATH.
    echo Instala Git for Windows y vuelve a ejecutar este archivo.
    >>"%LOG%" echo [ERROR] Git no encontrado.
    pause
    exit /b 1
)

for /f "delims=" %%G in ('where git 2^>nul') do (
    echo [OK] Git detectado: %%G
    >>"%LOG%" echo [OK] Git detectado: %%G
    goto :GIT_ENCONTRADO
)
:GIT_ENCONTRADO

set "MISSING=0"
for %%F in (
    "package.json"
    "package-lock.json"
    "Dockerfile"
    "railway.json"
    "app\page.tsx"
    "prisma\schema.prisma"
    "scripts\start-railway.mjs"
    "public\logo-linoem.png"
) do (
    if not exist "%%~F" (
        echo [ERROR] Falta: %%~F
        >>"%LOG%" echo [ERROR] Falta: %%~F
        set "MISSING=1"
    )
)

if "!MISSING!"=="1" (
    echo.
    echo [ERROR] La carpeta seleccionada no contiene el proyecto completo.
    echo No se realizo ninguna subida.
    pause
    exit /b 1
)

echo [OK] Archivos principales encontrados.
>>"%LOG%" echo [OK] Archivos principales encontrados.

rem ------------------------------------------------------------
rem 3. Proteger archivos locales y secretos.
rem ------------------------------------------------------------
if not exist ".gitignore" type nul > ".gitignore"

call :AGREGAR_IGNORE "node_modules/"
call :AGREGAR_IGNORE ".next/"
call :AGREGAR_IGNORE ".env"
call :AGREGAR_IGNORE ".env.local"
call :AGREGAR_IGNORE ".env.development.local"
call :AGREGAR_IGNORE ".env.test.local"
call :AGREGAR_IGNORE ".env.production.local"
call :AGREGAR_IGNORE "RAILWAY_VARIABLES_PRIVADAS.txt"
call :AGREGAR_IGNORE "GENERADOR_PORTALES_LOG.txt"
call :AGREGAR_IGNORE "SUBIDA_COMPLETA_GITHUB_LOG.txt"
call :AGREGAR_IGNORE "*.log"

rem Quitar del indice cualquier secreto que se hubiera agregado antes.
git rm --cached --ignore-unmatch -- ".env" ".env.local" ".env.development.local" ".env.test.local" ".env.production.local" "RAILWAY_VARIABLES_PRIVADAS.txt" "GENERADOR_PORTALES_LOG.txt" "%LOG_NAME%" >>"%LOG%" 2>&1

if not exist ".gitattributes" (
    >".gitattributes" echo * text=auto
    >>".gitattributes" echo *.bat text eol=crlf
    >>".gitattributes" echo *.cmd text eol=crlf
    >>".gitattributes" echo *.ps1 text eol=crlf
    >>".gitattributes" echo *.sh text eol=lf
)

echo [OK] Secretos y archivos generados excluidos.
>>"%LOG%" echo [OK] Secretos y archivos generados excluidos.

rem ------------------------------------------------------------
rem 4. Preparar Git local.
rem ------------------------------------------------------------
if not exist ".git" (
    echo [INFO] Inicializando repositorio Git local...
    git init >>"%LOG%" 2>&1
    if errorlevel 1 goto :ERROR_GENERAL
)

git config --local core.autocrlf true >>"%LOG%" 2>&1
git config --local pull.rebase false >>"%LOG%" 2>&1

for /f "delims=" %%N in ('git config user.name 2^>nul') do set "GIT_NAME=%%N"
if not defined GIT_NAME (
    git config user.name "Emanuel Rivera" >>"%LOG%" 2>&1
)

for /f "delims=" %%E in ('git config user.email 2^>nul') do set "GIT_EMAIL=%%E"
if not defined GIT_EMAIL (
    git config user.email "emannnuel55@gmail.com" >>"%LOG%" 2>&1
)

git branch -M main >>"%LOG%" 2>&1
if errorlevel 1 goto :ERROR_GENERAL

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin "%REPO_URL%" >>"%LOG%" 2>&1
) else (
    git remote set-url origin "%REPO_URL%" >>"%LOG%" 2>&1
)
if errorlevel 1 goto :ERROR_GENERAL

echo [OK] Remoto origin configurado.
>>"%LOG%" echo [OK] Remoto origin configurado: %REPO_URL%

rem ------------------------------------------------------------
rem 5. Agregar absolutamente todo lo permitido por .gitignore.
rem ------------------------------------------------------------
echo [INFO] Agregando carpetas, archivos ocultos y archivos faltantes...
git add -A >>"%LOG%" 2>&1
if errorlevel 1 goto :ERROR_GENERAL

rem Verificacion adicional de seguridad.
git reset --quiet -- ".env" ".env.local" ".env.development.local" ".env.test.local" ".env.production.local" "RAILWAY_VARIABLES_PRIVADAS.txt" "GENERADOR_PORTALES_LOG.txt" "%LOG_NAME%" 2>nul

git diff --cached --quiet
if errorlevel 1 (
    echo [INFO] Creando commit local con todos los archivos...
    git commit -m "fix: subir aplicacion completa y configuracion Railway" >>"%LOG%" 2>&1
    if errorlevel 1 goto :ERROR_GENERAL
    echo [OK] Commit local creado.
) else (
    echo [INFO] No hay cambios nuevos pendientes de commit.
)
>>"%LOG%" git status --short

rem ------------------------------------------------------------
rem 6. Crear rama local de respaldo antes de sincronizar.
rem ------------------------------------------------------------
for /f "delims=" %%T in ('powershell -NoLogo -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%T"
if not defined STAMP set "STAMP=manual"

set "BACKUP_BRANCH=backup-local-!STAMP!"
git show-ref --verify --quiet refs/heads/main
if not errorlevel 1 (
    git branch "!BACKUP_BRANCH!" main >>"%LOG%" 2>&1
    if not errorlevel 1 (
        echo [OK] Respaldo Git local creado: !BACKUP_BRANCH!
        >>"%LOG%" echo [OK] Respaldo Git local creado: !BACKUP_BRANCH!
    )
)

rem ------------------------------------------------------------
rem 7. Descargar el historial remoto y combinarlo sin perder
rem    los archivos completos locales.
rem ------------------------------------------------------------
echo.
echo [INFO] Sincronizando con GitHub antes de subir...
set "FETCH_TMP=%TEMP%\pvc_fetch_!RANDOM!.txt"
git fetch origin main >"!FETCH_TMP!" 2>&1
set "FETCH_CODE=!ERRORLEVEL!"
type "!FETCH_TMP!" >>"%LOG%"

if not "!FETCH_CODE!"=="0" (
    findstr /I /C:"couldn't find remote ref main" /C:"could not find remote ref main" "!FETCH_TMP!" >nul 2>&1
    if not errorlevel 1 (
        echo [INFO] El repositorio remoto aun no tiene rama main. Se creara al subir.
        >>"%LOG%" echo [INFO] Rama main remota inexistente.
    ) else (
        echo [ERROR] No fue posible comunicarse con GitHub.
        echo.
        type "!FETCH_TMP!"
        echo.
        echo Posibles causas:
        echo   - Proxy corporativo 407.
        echo   - GitHub bloqueado por la red.
        echo   - Sin conexion a Internet.
        echo.
        echo El commit local ya quedo preparado. Ejecuta este BAT desde
        echo una red que permita GitHub.
        del /q "!FETCH_TMP!" >nul 2>&1
        pause
        exit /b 2
    )
)
del /q "!FETCH_TMP!" >nul 2>&1

git show-ref --verify --quiet refs/remotes/origin/main
if not errorlevel 1 (
    git merge-base main origin/main >nul 2>&1
    if errorlevel 1 (
        echo [INFO] GitHub y la carpeta local tienen historiales distintos.
        echo [INFO] Se combinaran conservando como principal la version local completa.
        git merge origin/main --allow-unrelated-histories --no-edit -X ours >>"%LOG%" 2>&1
    ) else (
        echo [INFO] Integrando cambios remotos existentes...
        git merge origin/main --no-edit -X ours >>"%LOG%" 2>&1
    )

    if errorlevel 1 (
        set "CONFLICT_FILE=%TEMP%\pvc_conflicts_!RANDOM!.txt"
        git diff --name-only --diff-filter=U >"!CONFLICT_FILE!"

        for %%A in ("!CONFLICT_FILE!") do set "CONFLICT_SIZE=%%~zA"
        if defined CONFLICT_SIZE if !CONFLICT_SIZE! GTR 0 (
            echo [AVISO] Se detectaron conflictos. Se conservaran los archivos locales completos.
            >>"%LOG%" echo [AVISO] Resolviendo conflictos a favor de la version local.
            git checkout --ours -- . >>"%LOG%" 2>&1
            git add -A >>"%LOG%" 2>&1
            git commit -m "chore: sincronizar historial remoto conservando proyecto completo" >>"%LOG%" 2>&1
            if errorlevel 1 (
                del /q "!CONFLICT_FILE!" >nul 2>&1
                echo [ERROR] No fue posible cerrar la combinacion de historiales.
                echo Revisa el log: %LOG%
                pause
                exit /b 3
            )
        ) else (
            del /q "!CONFLICT_FILE!" >nul 2>&1
            echo [ERROR] Git no pudo combinar el historial remoto.
            echo Revisa el log: %LOG%
            git merge --abort >>"%LOG%" 2>&1
            pause
            exit /b 3
        )
        del /q "!CONFLICT_FILE!" >nul 2>&1
    )

    git diff --name-only --diff-filter=U | findstr . >nul 2>&1
    if not errorlevel 1 (
        echo [ERROR] Quedaron conflictos sin resolver.
        echo Se mantuvo la rama de respaldo: !BACKUP_BRANCH!
        echo Revisa el log: %LOG%
        pause
        exit /b 3
    )
)

rem ------------------------------------------------------------
rem 8. Confirmar que las carpetas importantes realmente quedaran
rem    incluidas en el commit que se va a subir.
rem ------------------------------------------------------------
set "TRACK_ERROR=0"
for %%F in (
    "app/page.tsx"
    "prisma/schema.prisma"
    "scripts/start-railway.mjs"
    "public/logo-linoem.png"
    "Dockerfile"
    "railway.json"
) do (
    git ls-files --error-unmatch "%%~F" >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Git no esta incluyendo: %%~F
        >>"%LOG%" echo [ERROR] Git no esta incluyendo: %%~F
        set "TRACK_ERROR=1"
    )
)

if "!TRACK_ERROR!"=="1" (
    echo.
    echo [ERROR] La validacion detecto archivos principales fuera del commit.
    echo No se realizara el push para evitar una subida incompleta.
    pause
    exit /b 4
)

for /f %%C in ('git ls-files ^| find /c /v ""') do set "TRACKED_COUNT=%%C"
echo [OK] Archivos controlados por Git: !TRACKED_COUNT!
>>"%LOG%" echo [OK] Archivos controlados por Git: !TRACKED_COUNT!

rem ------------------------------------------------------------
rem 9. Subir a GitHub. Git Credential Manager puede abrir el
rem    navegador para iniciar sesion.
rem ------------------------------------------------------------
echo.
echo ============================================================
echo  LISTO PARA SUBIR
echo ============================================================
echo Git puede abrir una ventana del navegador para autorizar tu cuenta.
echo No cierres esta ventana hasta ver el mensaje final.
echo.
pause

echo [INFO] Ejecutando push a GitHub...
git push -u origin main >>"%LOG%" 2>&1
set "PUSH_CODE=!ERRORLEVEL!"

if not "!PUSH_CODE!"=="0" (
    echo [AVISO] El primer push fallo. Se intentara sincronizar una vez mas...
    git fetch origin main >>"%LOG%" 2>&1
    if not errorlevel 1 (
        git merge origin/main --no-edit -X ours >>"%LOG%" 2>&1
        if errorlevel 1 (
            git checkout --ours -- . >>"%LOG%" 2>&1
            git add -A >>"%LOG%" 2>&1
            git commit -m "chore: resolver sincronizacion final con GitHub" >>"%LOG%" 2>&1
        )
        git push -u origin main >>"%LOG%" 2>&1
        set "PUSH_CODE=!ERRORLEVEL!"
    )
)

if not "!PUSH_CODE!"=="0" (
    echo.
    echo ============================================================
    echo  ERROR DURANTE EL PUSH
    echo ============================================================
    echo Revisa:
    echo   %LOG%
    echo.
    echo Si aparece 407 Proxy Authentication Required o Cache Access
    echo Denied, ejecuta este mismo BAT desde una red personal.
    echo.
    echo Tu trabajo NO se perdio. Existe el respaldo:
    echo   !BACKUP_BRANCH!
    pause
    exit /b 5
)

echo.
echo ============================================================
echo  SUBIDA COMPLETADA CORRECTAMENTE
echo ============================================================
echo.
echo Repositorio:
echo   %REPO_WEB%
echo.
echo Ya puedes regresar a Railway y presionar Redeploy manualmente.
echo Este BAT no modifica ni despliega Railway.
echo.
>>"%LOG%" echo [OK] PUSH COMPLETADO.
>>"%LOG%" git log -1 --oneline
start "" "%REPO_WEB%"
pause
exit /b 0

rem ------------------------------------------------------------
rem FUNCIONES
rem ------------------------------------------------------------
:AGREGAR_IGNORE
findstr /L /X /C:%1 ".gitignore" >nul 2>&1
if errorlevel 1 (
    >>".gitignore" echo %~1
)
exit /b 0

:ERROR_GENERAL
echo.
echo ============================================================
echo  ERROR DE GIT
echo ============================================================
echo Revisa el archivo:
echo   %LOG%
echo.
pause
exit /b 10
