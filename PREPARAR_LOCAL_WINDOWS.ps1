$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Instala Node.js 24 LTS." }
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env"; Write-Host "Se creo .env. Revisa DATABASE_URL y los secretos." -ForegroundColor Yellow }
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
Write-Host "Preparacion terminada. Ejecuta npm run dev" -ForegroundColor Green
