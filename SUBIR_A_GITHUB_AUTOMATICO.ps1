#requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$TranscriptStarted = $false

$RepoOwner = "emannnuel55-pixel"
$RepoName = "PUNTO-DE-VENTA-CELULARES"
$RepoFull = "$RepoOwner/$RepoName"
$RepoUrl = "https://github.com/$RepoFull.git"
$RepoWebUrl = "https://github.com/$RepoFull"
$Description = "Punto de venta, inventario y reparacion de celulares por LINOEM DEVELOPMENT"
$ProjectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ToolsPath = Join-Path $ProjectPath ".tools"
$LogPath = Join-Path $ProjectPath "SUBIDA_GITHUB_LOG.txt"
$GhVersion = "2.94.0"
$GhZipUrl = "https://github.com/cli/cli/releases/download/v$GhVersion/gh_${GhVersion}_windows_amd64.zip"

Set-Location $ProjectPath

function Write-Step([string]$Message) {
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "[AVISO] $Message" -ForegroundColor Yellow
}

function Test-NativeSuccess {
    param([scriptblock]$Command)
    & $Command *> $null
    return ($LASTEXITCODE -eq 0)
}

function Get-GitExecutable {
    $command = Get-Command git.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    $candidates = @(
        "$env:ProgramFiles\Git\cmd\git.exe",
        "$env:ProgramFiles\Git\bin\git.exe",
        "${env:ProgramFiles(x86)}\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    ) | Where-Object { $_ -and (Test-Path $_) }

    if ($candidates.Count -gt 0) { return $candidates[0] }
    throw "Git no esta instalado. Instala Git for Windows desde https://git-scm.com/download/win y ejecuta nuevamente este BAT."
}

function Get-GhExecutable {
    $command = Get-Command gh.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    $candidates = @(
        (Join-Path $ToolsPath "gh\bin\gh.exe"),
        "$env:ProgramFiles\GitHub CLI\gh.exe",
        "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe"
    ) | Where-Object { $_ -and (Test-Path $_) }

    if ($candidates.Count -gt 0) { return $candidates[0] }
    return $null
}

function Install-PortableGh {
    Write-Step "GitHub CLI no esta instalado. Se descargara una copia PORTATIL oficial; no se usara winget."
    New-Item -ItemType Directory -Force -Path $ToolsPath | Out-Null

    $downloadFolder = Join-Path $ToolsPath "download"
    $extractFolder = Join-Path $ToolsPath "gh-extract"
    $finalFolder = Join-Path $ToolsPath "gh"
    $zipPath = Join-Path $downloadFolder "gh.zip"

    Remove-Item $downloadFolder, $extractFolder, $finalFolder -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force -Path $downloadFolder, $extractFolder | Out-Null

    $downloaded = $false
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if ($curl) {
        Write-Step "Descargando GitHub CLI portable con curl..."
        & $curl.Source --location --fail --retry 3 --retry-delay 2 --connect-timeout 30 --output $zipPath $GhZipUrl
        $downloaded = ($LASTEXITCODE -eq 0 -and (Test-Path $zipPath) -and ((Get-Item $zipPath).Length -gt 1MB))
    }

    if (-not $downloaded) {
        Write-Warn "curl no pudo descargar el archivo. Intentando con PowerShell..."
        try {
            Invoke-WebRequest -Uri $GhZipUrl -OutFile $zipPath -UseBasicParsing -TimeoutSec 180
            $downloaded = ((Test-Path $zipPath) -and ((Get-Item $zipPath).Length -gt 1MB))
        } catch {
            Write-Warn "La descarga directa tampoco fue posible: $($_.Exception.Message)"
        }
    }

    if (-not $downloaded) { return $null }

    Write-Step "Descomprimiendo GitHub CLI portable..."
    try {
        Expand-Archive -Path $zipPath -DestinationPath $extractFolder -Force
    } catch {
        Write-Warn "No fue posible descomprimir GitHub CLI: $($_.Exception.Message)"
        return $null
    }
    $ghFile = Get-ChildItem -Path $extractFolder -Filter gh.exe -Recurse -File | Select-Object -First 1
    if (-not $ghFile) { return $null }

    New-Item -ItemType Directory -Force -Path (Join-Path $finalFolder "bin") | Out-Null
    Copy-Item $ghFile.FullName (Join-Path $finalFolder "bin\gh.exe") -Force

    $installedGh = Join-Path $finalFolder "bin\gh.exe"
    if (Test-Path $installedGh) {
        Write-Ok "GitHub CLI portable preparado dentro del proyecto."
        return $installedGh
    }

    return $null
}

function Initialize-Repository {
    param(
        [Parameter(Mandatory = $true)][string]$Git,
        [string]$CommitName,
        [string]$CommitEmail
    )

    Write-Step "Preparando repositorio Git local..."

    if (-not (Test-Path (Join-Path $ProjectPath ".git"))) {
        & $Git init
        if ($LASTEXITCODE -ne 0) { throw "No fue posible inicializar Git." }
    }

    & $Git branch -M main
    if ($LASTEXITCODE -ne 0) { throw "No fue posible configurar la rama main." }

    $currentName = (& $Git config --local user.name 2>$null | Out-String).Trim()
    if ([string]::IsNullOrWhiteSpace($currentName)) {
        if ([string]::IsNullOrWhiteSpace($CommitName)) { $CommitName = "Emanuel Rivera" }
        & $Git config --local user.name $CommitName
    }

    $currentEmail = (& $Git config --local user.email 2>$null | Out-String).Trim()
    if ([string]::IsNullOrWhiteSpace($currentEmail)) {
        if ([string]::IsNullOrWhiteSpace($CommitEmail)) { $CommitEmail = "emannnuel55@users.noreply.github.com" }
        & $Git config --local user.email $CommitEmail
    }

    & $Git add --all
    if ($LASTEXITCODE -ne 0) { throw "No fue posible agregar los archivos al repositorio." }

    $status = (& $Git status --porcelain | Out-String).Trim()
    if (-not [string]::IsNullOrWhiteSpace($status)) {
        & $Git commit -m "feat: plataforma Punto de Venta Celulares funcional"
        if ($LASTEXITCODE -ne 0) { throw "No fue posible crear el commit." }
        Write-Ok "Commit creado correctamente."
    } else {
        $hasHead = Test-NativeSuccess { & $Git rev-parse --verify HEAD }
        if (-not $hasHead) {
            & $Git commit --allow-empty -m "feat: inicia Punto de Venta Celulares"
            if ($LASTEXITCODE -ne 0) { throw "No fue posible crear el commit inicial." }
        }
        Write-Ok "El repositorio local ya estaba actualizado."
    }
}

function Configure-Origin {
    param([Parameter(Mandatory = $true)][string]$Git)

    & $Git remote get-url origin *> $null
    if ($LASTEXITCODE -eq 0) {
        & $Git remote set-url origin $RepoUrl
    } else {
        & $Git remote add origin $RepoUrl
    }

    if ($LASTEXITCODE -ne 0) { throw "No fue posible configurar el repositorio remoto." }
}

function Upload-WithGh {
    param(
        [Parameter(Mandatory = $true)][string]$Git,
        [Parameter(Mandatory = $true)][string]$Gh
    )

    Write-Step "Comprobando autenticacion oficial de GitHub..."
    & $Gh auth status --hostname github.com *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Se abrira el navegador para iniciar sesion en GitHub." -ForegroundColor Yellow
        & $Gh auth login --hostname github.com --git-protocol https --web
        if ($LASTEXITCODE -ne 0) { throw "La autenticacion oficial de GitHub no se completo." }
    }

    $login = (& $Gh api user --jq ".login" | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($login)) {
        throw "No fue posible leer la cuenta autenticada de GitHub."
    }

    if ($login -ne $RepoOwner) {
        Write-Warn "La cuenta autenticada es '$login', pero el destino solicitado es '$RepoOwner'."
        $answer = Read-Host "Escribe SI para continuar o cualquier otra cosa para cancelar"
        if ($answer.Trim().ToUpperInvariant() -ne "SI") { throw "Operacion cancelada." }
    }

    $displayName = (& $Gh api user --jq ".name // empty" | Out-String).Trim()
    if ([string]::IsNullOrWhiteSpace($displayName)) { $displayName = $login }
    $email = "$login@users.noreply.github.com"

    Initialize-Repository -Git $Git -CommitName $displayName -CommitEmail $email

    & $Gh repo view $RepoFull *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Step "Creando el repositorio $RepoFull..."
        & $Gh repo create $RepoFull --public --description $Description
        if ($LASTEXITCODE -ne 0) { throw "No fue posible crear el repositorio en GitHub." }
        Configure-Origin -Git $Git
        & $Git push --set-upstream origin main
        if ($LASTEXITCODE -ne 0) { throw "El repositorio fue creado, pero GitHub rechazo la subida de archivos." }
    } else {
        Write-Step "El repositorio ya existe. Actualizando archivos..."
        Configure-Origin -Git $Git
        & $Git push --set-upstream origin main
        if ($LASTEXITCODE -ne 0) { throw "GitHub rechazo la subida. Revisa la cuenta autenticada y los permisos." }
    }
}

function Wait-ForRepositoryCreation {
    param([Parameter(Mandatory = $true)][string]$Git)

    $newRepoUrl = "https://github.com/new?owner=$RepoOwner&name=$RepoName&description=$([Uri]::EscapeDataString($Description))&visibility=public"
    Write-Warn "No se pudo preparar GitHub CLI portable. Se usara el modo Git + navegador."
    Write-Host "El navegador abrira la pagina oficial para crear el repositorio." -ForegroundColor Yellow
    Write-Host "1. Verifica que el propietario sea: $RepoOwner" -ForegroundColor White
    Write-Host "2. Nombre: $RepoName" -ForegroundColor White
    Write-Host "3. Dejalo PUBLICO." -ForegroundColor White
    Write-Host "4. NO agregues README, .gitignore ni licencia." -ForegroundColor White
    Write-Host "5. Pulsa Create repository. El script detectara cuando exista." -ForegroundColor White

    Start-Process $newRepoUrl

    $deadline = (Get-Date).AddMinutes(12)
    while ((Get-Date) -lt $deadline) {
        & $Git ls-remote $RepoUrl *> $null
        if ($LASTEXITCODE -eq 0) {
            Write-Ok "Repositorio detectado en GitHub."
            return
        }
        Write-Host "." -NoNewline -ForegroundColor DarkGray
        Start-Sleep -Seconds 5
    }

    throw "No se detecto el repositorio despues de 12 minutos. Crealo en $RepoWebUrl y ejecuta el BAT nuevamente."
}

function Upload-WithGitOnly {
    param([Parameter(Mandatory = $true)][string]$Git)

    Initialize-Repository -Git $Git -CommitName "Emanuel Rivera" -CommitEmail "emannnuel55@users.noreply.github.com"
    Configure-Origin -Git $Git

    & $Git ls-remote $RepoUrl *> $null
    if ($LASTEXITCODE -ne 0) {
        Wait-ForRepositoryCreation -Git $Git
    }

    Write-Step "Subiendo archivos con Git. Si Windows solicita autenticacion, se abrira el navegador oficial de GitHub."
    & $Git push --set-upstream origin main
    if ($LASTEXITCODE -ne 0) {
        throw "La subida con Git fallo. Comprueba que iniciaste sesion con la cuenta $RepoOwner y que el repositorio existe."
    }
}

try {
    try {
        Start-Transcript -Path $LogPath -Force | Out-Null
        $TranscriptStarted = $true
    } catch {
        Write-Warn "No se pudo iniciar el archivo de log, pero la subida continuara."
    }

    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " PUNTO DE VENTA CELULARES - SUBIDA AUTOMATICA A GITHUB" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "Proyecto: $ProjectPath"
    Write-Host "Destino:  $RepoWebUrl"
    Write-Host "Log:      $LogPath"
    Write-Host ""

    $Git = Get-GitExecutable
    Write-Ok "Git detectado: $Git"

    $Gh = Get-GhExecutable
    if (-not $Gh) { $Gh = Install-PortableGh }

    if ($Gh) {
        Write-Ok "GitHub CLI disponible: $Gh"
        Upload-WithGh -Git $Git -Gh $Gh
    } else {
        Upload-WithGitOnly -Git $Git
    }

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " SUBIDA COMPLETADA CORRECTAMENTE" -ForegroundColor Green
    Write-Host " $RepoWebUrl" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Start-Process $RepoWebUrl
}
catch {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host " Revisa el archivo: $LogPath" -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Red
    exit 1
}
finally {
    if ($TranscriptStarted) {
        try { Stop-Transcript | Out-Null } catch { }
    }
}
