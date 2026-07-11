$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Instala Node.js 22 LTS y activa Add to PATH."
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm no esta disponible en PATH."
}

$nodeVersion = (& node --version).TrimStart('v').Split('.')[0]
if ([int]$nodeVersion -ne 22) {
    Write-Host "[AVISO] Se recomienda Node.js 22 LTS. Version detectada: $(& node --version)" -ForegroundColor Yellow
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Se creo .env. Revisa DATABASE_URL, SESSION_SECRET y ACCESS_CODE_SECRET." -ForegroundColor Yellow
}

npm ci --no-audit --no-fund
npm run db:generate
npm run db:deploy

Write-Host "Preparacion terminada." -ForegroundColor Green
Write-Host "Para datos demo, usa: set ALLOW_DEMO_SEED=true y npm run db:seed" -ForegroundColor Cyan
Write-Host "Para iniciar: npm run dev" -ForegroundColor Cyan
