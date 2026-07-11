#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LINOEM DEVELOPMENT
CORREGIR, COMPILAR Y ACTUALIZAR GITHUB — V3 WINDOWS

Soluciona especialmente:
- [WinError 2] al ejecutar npm desde Python en Windows.
- npm.cmd/npx.cmd instalados junto a node.exe.
- Configuración dañada por cambios anteriores en Docker/Railway/Prisma.
- Sincronización segura del proyecto completo con GitHub.

Destino:
https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import shutil
import subprocess
import sys
import webbrowser
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

REPO_URL = "https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git"
REPO_WEB = "https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES"
EXPECTED_PACKAGE = "punto-de-venta-celulares"
LOG_NAME = "ACTUALIZACION_GITHUB_V3_LOG.txt"
REPORT_NAME = "REPORTE_VALIDACION_V3.txt"

SEARCH_ROOTS = [
    Path(r"C:\Users\jesriver\Documents"),
    Path(r"C:\Users\jesriver\Documents\CELULARES"),
    Path(r"C:\Users\Emanuel1996\Pictures"),
    Path.home() / "Documents",
    Path.home() / "Desktop",
    Path.home() / "Downloads",
]

EXCLUDED_DIRS = {
    ".git",
    ".next",
    "node_modules",
    "generated",
    "_auto_backups",
    ".tools",
}

PRIVATE_PATHS = [
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.production",
    ".env.production.local",
    "RAILWAY_VARIABLES_PRIVADAS.txt",
    LOG_NAME,
    REPORT_NAME,
    "_auto_backups",
]

CANONICAL_DOCKERFILE = r"""# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_PROGRESS=false \
    NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm install --global npm@10.9.2 \
    && npm ci --no-audit --no-fund --prefer-offline

FROM node:22-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=1536 \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public \
    SESSION_SECRET=build-only-session-secret-not-used-at-runtime-minimum-48-characters \
    ACCESS_CODE_SECRET=build-only-access-secret-not-used-at-runtime-minimum-48-characters

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --home-dir /app --shell /usr/sbin/nologin nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/scripts ./scripts

RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 8080

CMD ["npm", "run", "start:railway"]
"""

CANONICAL_PRISMA_CONFIG = r"""import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
"""

CANONICAL_START = r"""import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });

    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} terminó con código ${code}`));
    });
  });
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está configurada en Railway.");
}

const port = process.env.PORT || "8080";
await run("npx", ["--no-install", "prisma", "migrate", "deploy"]);
await run("npx", ["--no-install", "next", "start", "-H", "0.0.0.0", "-p", port]);
"""

CANONICAL_RAILWAY = {
    "$schema": "https://railway.com/railway.schema.json",
    "build": {
        "builder": "DOCKERFILE",
        "dockerfilePath": "Dockerfile",
    },
    "deploy": {
        "startCommand": "npm run start:railway",
        "healthcheckPath": "/api/health",
        "healthcheckTimeout": 180,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 3,
    },
}


class AppError(RuntimeError):
    pass


class Logger:
    def __init__(self) -> None:
        self.path: Path | None = None

    def bind(self, project: Path) -> None:
        self.path = project / LOG_NAME
        self.path.write_text(
            "LINOEM DEVELOPMENT - ACTUALIZADOR V3\n"
            f"Fecha: {dt.datetime.now().isoformat()}\n"
            f"Proyecto: {project}\n"
            f"Repositorio: {REPO_URL}\n\n",
            encoding="utf-8",
        )

    def write(self, message: str = "") -> None:
        print(message, flush=True)
        if self.path:
            with self.path.open("a", encoding="utf-8") as handle:
                handle.write(message + "\n")


log = Logger()


@dataclass(frozen=True)
class Tool:
    name: str
    kind: str
    path: Path
    node_path: Path | None = None


TOOLS: dict[str, Tool] = {}


def pause() -> None:
    try:
        input("\nPresiona ENTER para cerrar...")
    except EOFError:
        pass


def ask(question: str, default_yes: bool = True) -> bool:
    suffix = "[S/n]" if default_yes else "[s/N]"
    answer = input(f"{question} {suffix}: ").strip().lower()
    if not answer:
        return default_yes
    return answer in {"s", "si", "sí", "y", "yes"}


def existing_file(candidates: Iterable[Path | None]) -> Path | None:
    for candidate in candidates:
        if candidate and candidate.is_file():
            return candidate.resolve()
    return None


def resolve_tool(name: str) -> Tool:
    is_windows = os.name == "nt"
    suffixes = ["", ".exe", ".cmd", ".bat"] if is_windows else [""]

    which_candidates: list[Path] = []
    for suffix in suffixes:
        found = shutil.which(name + suffix)
        if found:
            which_candidates.append(Path(found))

    program_files = Path(os.environ.get("ProgramFiles", r"C:\Program Files"))
    local_app = Path(os.environ.get("LOCALAPPDATA", str(Path.home() / "AppData/Local")))
    node_dir_candidates = [
        program_files / "nodejs",
        local_app / "Programs" / "nodejs",
        Path(r"C:\Program Files\nodejs"),
    ]

    if name == "node":
        path = existing_file(
            [*which_candidates, *(directory / "node.exe" for directory in node_dir_candidates)]
        )
        if path:
            return Tool(name, "executable", path)

    if name in {"npm", "npx"}:
        node_tool = TOOLS.get("node") or resolve_tool("node")
        node_dir_candidates.insert(0, node_tool.path.parent)

        # En Windows, ejecutar npm.cmd desde subprocess puede fallar por
        # comillas y espacios en "C:\\Program Files". La opción más estable
        # es ejecutar directamente npm-cli.js/npx-cli.js con node.exe.
        cli_name = "npm-cli.js" if name == "npm" else "npx-cli.js"
        cli_path = existing_file(
            directory / "node_modules" / "npm" / "bin" / cli_name
            for directory in node_dir_candidates
        )
        if cli_path:
            return Tool(name, "node-script", cli_path, node_tool.path)

        # Respaldo para instalaciones donde solo exista npm.cmd/npx.cmd.
        cmd_name = f"{name}.cmd"
        cmd_path = existing_file(
            [*which_candidates, *(directory / cmd_name for directory in node_dir_candidates)]
        )
        if cmd_path:
            return Tool(name, "cmd", cmd_path, node_tool.path)

    if name == "git":
        git_candidates = [
            *which_candidates,
            program_files / "Git" / "cmd" / "git.exe",
            program_files / "Git" / "bin" / "git.exe",
            Path(r"C:\Program Files\Git\cmd\git.exe"),
        ]
        path = existing_file(git_candidates)
        if path:
            return Tool(name, "executable", path)

    path = existing_file(which_candidates)
    if path:
        kind = "cmd" if path.suffix.lower() in {".cmd", ".bat"} else "executable"
        return Tool(name, kind, path)

    raise AppError(
        f"No encontré {name}. "
        "Para Node/npm, repara Node.js 22 LTS y asegúrate de que exista "
        r"C:\Program Files\nodejs\npm.cmd."
    )


def prepare_tools() -> None:
    for name in ("node", "npm", "npx", "git"):
        TOOLS[name] = resolve_tool(name)
        log.write(f"[OK] {name}: {TOOLS[name].path} [{TOOLS[name].kind}]")


def make_command(tool_name: str, args: list[str]) -> list[str]:
    tool = TOOLS[tool_name]

    if tool.kind == "cmd":
        # Fallback robusto: CALL permite ejecutar correctamente archivos .cmd
        # ubicados en rutas con espacios.
        comspec = os.environ.get("COMSPEC", r"C:\Windows\System32\cmd.exe")
        return [comspec, "/d", "/s", "/c", "call", str(tool.path), *args]

    if tool.kind == "node-script":
        if tool.node_path is None:
            raise AppError(f"No hay node.exe para ejecutar {tool.name}.")
        return [str(tool.node_path), str(tool.path), *args]

    return [str(tool.path), *args]


def run_tool(
    tool_name: str,
    args: list[str],
    cwd: Path,
    *,
    check: bool = True,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    return run(make_command(tool_name, args), cwd, check=check, env=env)


def run(
    command: list[str],
    cwd: Path,
    *,
    check: bool = True,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    shown = subprocess.list2cmdline(command)
    log.write(f"\n$ {shown}")

    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)

    process = subprocess.Popen(
        command,
        cwd=str(cwd),
        env=merged_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        errors="replace",
        bufsize=1,
    )

    lines: list[str] = []
    assert process.stdout is not None
    for line in process.stdout:
        clean = line.rstrip("\r\n")
        lines.append(clean)
        log.write(clean)

    code = process.wait()
    result = subprocess.CompletedProcess(command, code, "\n".join(lines), "")
    if check and code != 0:
        raise AppError(f"Falló con código {code}: {shown}")
    return result


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except Exception as exc:
        raise AppError(f"No pude leer {path}: {exc}") from exc


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        content.replace("\r\n", "\n").rstrip() + "\n",
        encoding="utf-8",
        newline="\n",
    )
    log.write(f"[OK] Corregido: {path}")


def project_score(path: Path) -> int:
    package_path = path / "package.json"
    if not package_path.is_file():
        return -1

    try:
        package = read_json(package_path)
    except AppError:
        return -1

    score = 0
    if package.get("name") == EXPECTED_PACKAGE:
        score += 60

    for relative, points in [
        ("app/page.tsx", 10),
        ("app/api/health/route.ts", 10),
        ("lib/db.ts", 10),
        ("prisma/schema.prisma", 15),
        ("prisma/migrations", 10),
        ("package-lock.json", 20),
        ("public/logo-linoem.png", 5),
        ("scripts/start-railway.mjs", 10),
        ("Dockerfile", 10),
        ("railway.json", 10),
    ]:
        if (path / relative).exists():
            score += points

    if "punto-de-venta-celulares" in str(path).lower():
        score += 20

    git_config = path / ".git" / "config"
    if git_config.is_file():
        text = git_config.read_text(encoding="utf-8", errors="ignore")
        if "PUNTO-DE-VENTA-CELULARES".lower() in text.lower():
            score += 50

    return score


def scan(root: Path) -> list[tuple[int, Path]]:
    if not root.exists():
        return []

    found: list[tuple[int, Path]] = []
    root_depth = len(root.parts)

    for current, dirs, files in os.walk(root):
        path = Path(current)
        dirs[:] = [
            item
            for item in dirs
            if item not in EXCLUDED_DIRS
            and item not in {"AppData", "$Recycle.Bin", "System Volume Information"}
            and not item.startswith("$")
        ]

        if len(path.parts) - root_depth > 10:
            dirs[:] = []
            continue

        if "package.json" in files:
            score = project_score(path)
            if score >= 120:
                found.append((score, path))
                dirs[:] = []

    return sorted(found, key=lambda value: (value[0], str(value[1])), reverse=True)


def locate_project(explicit: str | None) -> Path:
    if explicit:
        candidate = Path(explicit).resolve()
        if project_score(candidate) >= 120:
            return candidate
        raise AppError(f"La ruta indicada no contiene el proyecto completo: {candidate}")

    direct = [Path.cwd(), Path(__file__).resolve().parent]
    for candidate in direct:
        if project_score(candidate) >= 120:
            return candidate

    matches: list[tuple[int, Path]] = []
    for root in SEARCH_ROOTS:
        log.write(f"[INFO] Buscando en: {root}")
        matches.extend(scan(root))

    if not matches:
        raise AppError(
            "No encontré una copia completa. Coloca este Python junto a "
            "package.json, app, prisma, package-lock.json y Dockerfile."
        )

    matches.sort(key=lambda value: value[0], reverse=True)
    log.write("[INFO] Copias válidas:")
    for score, path in matches[:10]:
        log.write(f"  {score:03d} puntos: {path}")

    selected = matches[0][1]
    log.write(f"[OK] Copia seleccionada: {selected}")
    return selected


def validate_structure(project: Path) -> None:
    required = [
        "package.json",
        "package-lock.json",
        "app/page.tsx",
        "app/login/page.tsx",
        "app/cliente/page.tsx",
        "app/panel/page.tsx",
        "app/api/health/route.ts",
        "components/AppLogo.tsx",
        "lib/db.ts",
        "prisma/schema.prisma",
        "prisma/migrations",
        "public/logo-linoem.png",
        "scripts/start-railway.mjs",
        "Dockerfile",
        "railway.json",
        "prisma.config.ts",
    ]
    missing = [item for item in required if not (project / item).exists()]
    if missing:
        raise AppError("La copia está incompleta. Faltan: " + ", ".join(missing))


def create_backup(project: Path) -> Path:
    target_dir = project / "_auto_backups"
    target_dir.mkdir(exist_ok=True)
    target = target_dir / f"proyecto_completo_v3_{dt.datetime.now():%Y%m%d-%H%M%S}.zip"

    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in project.rglob("*"):
            if not path.is_file():
                continue
            relative = path.relative_to(project)
            if any(part in EXCLUDED_DIRS for part in relative.parts):
                continue
            if relative.as_posix() in PRIVATE_PATHS:
                continue
            archive.write(path, relative)

    return target


def patch_package_json(project: Path) -> None:
    path = project / "package.json"
    package = read_json(path)
    scripts = package.setdefault("scripts", {})

    scripts["dev"] = "next dev"
    scripts["build"] = "next build"
    scripts["prebuild"] = "npm run db:generate"
    scripts["start"] = "next start -H 0.0.0.0"
    scripts["start:railway"] = "node scripts/start-railway.mjs"
    scripts["db:generate"] = "prisma generate"
    scripts["db:deploy"] = "prisma migrate deploy"
    scripts["verify"] = "npm run lint && npm run typecheck && npm run test && npm run build"

    package.setdefault("engines", {})["node"] = ">=22.12.0 <23"
    package["packageManager"] = "npm@10.9.2"

    path.write_text(
        json.dumps(package, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    log.write("[OK] Corregido: package.json")


def apply_corrections(project: Path) -> None:
    write_text(project / "Dockerfile", CANONICAL_DOCKERFILE)
    write_text(project / "prisma.config.ts", CANONICAL_PRISMA_CONFIG)
    write_text(project / "scripts" / "start-railway.mjs", CANONICAL_START)
    write_text(
        project / "railway.json",
        json.dumps(CANONICAL_RAILWAY, indent=2, ensure_ascii=False),
    )
    patch_package_json(project)

    lock_path = project / "package-lock.json"
    if lock_path.stat().st_size < 1000:
        raise AppError("package-lock.json parece incompleto o corrupto.")

    log.write("[OK] package-lock.json conservado. No debe eliminarse.")


def build_environment() -> dict[str, str]:
    return {
        "DATABASE_URL": "postgresql://postgres:postgres@127.0.0.1:5432/punto_venta?schema=public",
        "SESSION_SECRET": "local-build-session-secret-2026-minimum-48-characters-safe-value",
        "ACCESS_CODE_SECRET": "local-build-access-code-secret-2026-minimum-48-characters-safe-value",
        "NEXT_PUBLIC_APP_NAME": "PUNTO DE VENTA CELULARES",
        "NEXT_PUBLIC_COMPANY_NAME": "LINOEM DEVELOPMENT",
        "NEXT_TELEMETRY_DISABLED": "1",
        "NODE_OPTIONS": "--max-old-space-size=3072",
        "NPM_CONFIG_AUDIT": "false",
        "NPM_CONFIG_FUND": "false",
        "NPM_CONFIG_UPDATE_NOTIFIER": "false",
        "CI": "1",
    }


def compile_project(project: Path) -> dict[str, str]:
    env = build_environment()
    results: dict[str, str] = {}

    node_version = run_tool("node", ["--version"], project, env=env).stdout.strip()
    npm_version = run_tool("npm", ["--version"], project, env=env).stdout.strip()
    git_version = run_tool("git", ["--version"], project, env=env).stdout.strip()

    log.write(f"[INFO] Node: {node_version}")
    log.write(f"[INFO] npm: {npm_version}")
    log.write(f"[INFO] Git: {git_version}")

    install = run_tool(
        "npm",
        ["ci", "--no-audit", "--no-fund", "--prefer-online"],
        project,
        check=False,
        env=env,
    )

    if install.returncode != 0:
        log.write("[AVISO] npm ci falló. Limpiando node_modules y reintentando.")
        shutil.rmtree(project / "node_modules", ignore_errors=True)
        install = run_tool(
            "npm",
            ["ci", "--no-audit", "--no-fund", "--prefer-online"],
            project,
            check=False,
            env=env,
        )

    if install.returncode != 0:
        raise AppError("No se pudieron instalar las dependencias con npm ci.")

    results["Dependencias"] = "APROBADO"

    stages = [
        ("Prisma Client", ["run", "db:generate"]),
        ("ESLint", ["run", "lint"]),
        ("TypeScript", ["run", "typecheck"]),
        ("Pruebas", ["run", "test"]),
        ("Next.js build", ["run", "build"]),
    ]

    for name, args in stages:
        log.write(f"\n=== {name.upper()} ===")
        result = run_tool("npm", args, project, check=False, env=env)
        if result.returncode != 0:
            results[name] = "FALLÓ"
            raise AppError(f"La etapa {name} falló. Revisa {LOG_NAME}.")
        results[name] = "APROBADO"

    return results


def git(project: Path, args: list[str], check: bool = True):
    return run_tool("git", args, project, check=check)


def configure_git(project: Path) -> None:
    if not (project / ".git").exists():
        git(project, ["init"])

    git(project, ["branch", "-M", "main"])

    remote = git(project, ["remote", "get-url", "origin"], check=False)
    if remote.returncode == 0:
        git(project, ["remote", "set-url", "origin", REPO_URL])
    else:
        git(project, ["remote", "add", "origin", REPO_URL])

    if git(project, ["config", "user.name"], check=False).returncode != 0:
        git(project, ["config", "user.name", "Emanuel Rivera"])
    if git(project, ["config", "user.email"], check=False).returncode != 0:
        git(project, ["config", "user.email", "emannnuel55@gmail.com"])


def unstage_private_files(project: Path) -> None:
    git(
        project,
        ["rm", "-r", "--cached", "--ignore-unmatch", "--", *PRIVATE_PATHS],
        check=False,
    )


def commit_full_project(project: Path) -> None:
    configure_git(project)
    git(project, ["add", "-A"])
    unstage_private_files(project)

    diff = git(project, ["diff", "--cached", "--quiet"], check=False)
    if diff.returncode != 0:
        git(
            project,
            [
                "commit",
                "-m",
                "fix: restaurar proyecto completo validar build y corregir Railway",
            ],
        )
    else:
        log.write("[INFO] No hay cambios nuevos para commit.")


def integrate_remote_safely(project: Path) -> None:
    fetch = git(project, ["fetch", "origin", "main"], check=False)
    if fetch.returncode != 0:
        output = (fetch.stdout or "").lower()
        if "couldn't find remote ref" in output or "could not find remote ref" in output:
            log.write("[INFO] El remoto no tiene main; se creará al subir.")
            return
        raise AppError(
            "No pude consultar GitHub. Si aparece 407, usa una red personal."
        )

    timestamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_branch = f"backup-remoto-antes-restauracion-{timestamp}"

    git(project, ["branch", backup_branch, "origin/main"], check=False)
    backup_push = git(
        project,
        ["push", "origin", f"{backup_branch}:{backup_branch}"],
        check=False,
    )
    if backup_push.returncode == 0:
        log.write(f"[OK] Respaldo remoto: {backup_branch}")
    else:
        log.write("[AVISO] No se pudo publicar la rama de respaldo remoto.")

    merge = git(
        project,
        [
            "merge",
            "origin/main",
            "--allow-unrelated-histories",
            "--strategy=ours",
            "--no-edit",
        ],
        check=False,
    )
    if merge.returncode != 0:
        output = (merge.stdout or "").lower()
        if "already up to date" not in output:
            raise AppError("No se pudo integrar el historial remoto de forma segura.")


def push_to_github(project: Path) -> None:
    commit_full_project(project)
    integrate_remote_safely(project)

    push = git(project, ["push", "-u", "origin", "main"], check=False)
    if push.returncode != 0:
        raise AppError(
            "No se pudo subir a GitHub. Autoriza Git Credential Manager "
            "o usa una red sin bloqueo 407."
        )

    log.write("[OK] GitHub actualizado correctamente.")
    webbrowser.open(REPO_WEB)


def write_report(
    project: Path,
    results: dict[str, str],
    success: bool,
    error: str = "",
) -> None:
    lines = [
        "LINOEM DEVELOPMENT",
        "PUNTO DE VENTA CELULARES",
        "REPORTE DE VALIDACIÓN V3",
        "=" * 64,
        f"Fecha: {dt.datetime.now().isoformat()}",
        f"Proyecto: {project}",
        f"Repositorio: {REPO_WEB}",
        f"Resultado general: {'APROBADO' if success else 'FALLÓ'}",
        "",
    ]
    for name, value in results.items():
        lines.append(f"- {name}: {value}")
    if error:
        lines.extend(["", "ERROR:", error])
    lines.extend(["", f"Log completo: {project / LOG_NAME}"])
    (project / REPORT_NAME).write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", help="Ruta exacta del proyecto")
    args = parser.parse_args()

    print("=" * 72)
    print(" LINOEM DEVELOPMENT")
    print(" CORREGIR, COMPILAR Y ACTUALIZAR GITHUB — V3")
    print("=" * 72)

    project = locate_project(args.project)
    log.bind(project)
    log.write(f"[OK] Proyecto: {project}")

    validate_structure(project)
    prepare_tools()

    backup = create_backup(project)
    log.write(f"[OK] Respaldo local: {backup}")

    results: dict[str, str] = {}
    success = False
    error = ""

    try:
        apply_corrections(project)
        results["Correcciones"] = "APROBADO"

        if ask("¿Instalar dependencias, ejecutar pruebas y compilar?"):
            results.update(compile_project(project))
        else:
            results["Validación"] = "OMITIDA"

        if ask("¿Restaurar el proyecto completo en GitHub?"):
            push_to_github(project)
            results["GitHub"] = "ACTUALIZADO"
        else:
            results["GitHub"] = "OMITIDO"

        success = True

    except Exception as exc:
        error = str(exc)
        log.write(f"\n[ERROR] {error}")

    write_report(project, results, success, error)

    if not success:
        raise AppError(f"El proceso terminó con errores. Revisa {project / LOG_NAME}")

    log.write("\nPROCESO TERMINADO CORRECTAMENTE")
    log.write("Railway iniciará un despliegue nuevo desde main.")
    return 0


if __name__ == "__main__":
    code = 0
    try:
        code = main()
    except KeyboardInterrupt:
        print("\nProceso cancelado.")
        code = 130
    except Exception as exc:
        log.write(f"\n[ERROR FINAL] {exc}")
        code = 1

    pause()
    raise SystemExit(code)
