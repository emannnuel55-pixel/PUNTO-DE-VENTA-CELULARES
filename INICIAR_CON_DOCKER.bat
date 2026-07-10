@echo off
setlocal
cd /d "%~dp0"
where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker Desktop no esta instalado o no esta iniciado.
  echo Instala o abre Docker Desktop y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

echo ============================================================
echo  PUNTO DE VENTA CELULARES - INICIO LOCAL CON DOCKER
echo ============================================================
echo [1/4] Iniciando PostgreSQL...
docker compose up -d db || goto :error

echo [2/4] Construyendo la aplicacion...
docker compose build app || goto :error

echo [3/4] Aplicando migraciones y datos de demostracion...
docker compose run --rm -e NODE_ENV=development -e ALLOW_DEMO_SEED=true app sh -c "npm run db:deploy && npm run db:seed" || goto :error

echo [4/4] Iniciando la plataforma...
echo Abre: http://localhost:3000
echo Usuario: admin@linoem.mx
echo Contrasena: LinoemDemo2026!
docker compose up app
exit /b 0

:error
echo.
echo [ERROR] No fue posible iniciar la plataforma.
docker compose logs --tail=100
pause
exit /b 1
