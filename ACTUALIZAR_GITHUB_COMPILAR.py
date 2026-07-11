#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Compila, valida y actualiza el repositorio PUNTO-DE-VENTA-CELULARES.

El archivo puede ejecutarse desde cualquier carpeta. Primero intenta usar la
carpeta donde está guardado; después busca copias válidas en las rutas comunes
de las PC del usuario.

No solicita ni guarda tokens. Git Credential Manager realiza la autenticación.
"""

from __future__ import annotations

import datetime as dt
import json
import os
import shutil
import subprocess
import sys
import time
import webbrowser
import zipfile
from pathlib import Path
from typing import Iterable

REPO_URL = "https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git"
REPO_WEB = "https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES"
EXPECTED_PACKAGE = "punto-de-venta-celulares"
LOG_NAME = "ACTUALIZACION_GITHUB_LOG.txt"
REPORT_NAME = "REPORTE_VALIDACION_LOCAL.txt"

SEARCH_ROOTS = [
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


class AppError(RuntimeError):
    """Error controlado del actualizador."""


class Logger:
    def __init__(self) -> None:
        self.path: Path | None = None

    def bind(self, project: Path) -> None:
        self.path = project / LOG_NAME
        self.path.write_text(
            "LINOEM DEVELOPMENT - ACTUALIZADOR GITHUB\n"
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


def command_exists(name: str) -> bool:
    return shutil.which(name) is not None


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


def read_package(path: Path) -> dict:
    try:
        return json.loads((path / "package.json").read_text(encoding="utf-8-sig"))
    except Exception:
        return {}


def project_score(path: Path) -> int:
    if not (path / "package.json").is_file():
        return -1

    package = read_package(path)
    score = 0
    if package.get("name") == EXPECTED_PACKAGE:
        score += 50

    for relative, points in [
        ("app/page.tsx", 10),
        ("app/api/health/route.ts", 10),
        ("components", 5),
        ("lib/db.ts", 10),
        ("prisma/schema.prisma", 15),
        ("prisma/migrations", 10),
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
            if score >= 100:
                found.append((score, path))
                dirs[:] = []

    return sorted(found, key=lambda value: (value[0], str(value[1])), reverse=True)


def locate_project() -> Path:
    direct = [Path.cwd(), Path(__file__).resolve().parent]
    for candidate in direct:
        if project_score(candidate) >= 100:
            return candidate

    matches: list[tuple[int, Path]] = []
    for root in SEARCH_ROOTS:
        log.write(f"[INFO] Buscando en: {root}")
        matches.extend(scan(root))

    if not matches:
        raise AppError(
            "No encontré una copia completa. Coloca este Python dentro de la "
            "carpeta que contiene package.json, app, prisma, Dockerfile y railway.json."
        )

    matches.sort(key=lambda value: value[0], reverse=True)
    log.write("[INFO] Copias válidas encontradas:")
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

    tools = [item for item in ("node", "npm", "git") if not command_exists(item)]
    if tools:
        raise AppError(
            "Faltan herramientas: " + ", ".join(tools) + ". Instala Node.js 22 LTS y Git for Windows."
        )


def create_backup(project: Path) -> Path:
    target_dir = project / "_auto_backups"
    target_dir.mkdir(exist_ok=True)
    target = target_dir / f"proyecto_completo_{dt.datetime.now():%Y%m%d-%H%M%S}.zip"

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


def build_environment() -> dict[str, str]:
    return {
        # Prisma generate y Next build no necesitan que esta base exista.
        "DATABASE_URL": "postgresql://postgres:postgres@127.0.0.1:5432/punto_venta?schema=public",
        "SESSION_SECRET": "local-build-session-secret-2026-minimum-48-characters-safe-value",
        "ACCESS_CODE_SECRET": "local-build-access-code-secret-2026-minimum-48-characters-safe-value",
        "NEXT_PUBLIC_APP_NAME": "PUNTO DE VENTA CELULARES",
        "NEXT_PUBLIC_COMPANY_NAME": "LINOEM DEVELOPMENT",
        "NEXT_TELEMETRY_DISABLED": "1",
        "NODE_OPTIONS": "--max-old-space-size=3072",
        "NPM_CONFIG_AUDIT": "false",
        "NPM_CONFIG_FUND": "false",
        "CI": "1",
    }


def compile_project(project: Path) -> dict[str, str]:
    env = build_environment()
    results: dict[str, str] = {}

    node_version = run(["node", "--version"], project, env=env).stdout.strip()
    npm_version = run(["npm", "--version"], project, env=env).stdout.strip()
    log.write(f"[INFO] Node: {node_version}")
    log.write(f"[INFO] npm: {npm_version}")

    install = run(
        ["npx", "--yes", "npm@10.9.2", "ci", "--no-audit", "--no-fund"],
        project,
        check=False,
        env=env,
    )
    if install.returncode != 0:
        log.write("[AVISO] Primer npm ci falló. Limpiando node_modules y reintentando una vez.")
        shutil.rmtree(project / "node_modules", ignore_errors=True)
        install = run(
            [
                "npx",
                "--yes",
                "npm@10.9.2",
                "ci",
                "--no-audit",
                "--no-fund",
                "--prefer-online",
            ],
            project,
            check=False,
            env=env,
        )
    if install.returncode != 0:
        raise AppError("No se pudieron instalar las dependencias.")
    results["Dependencias"] = "APROBADO"

    stages = [
        ("Prisma Client", ["npm", "run", "db:generate"]),
        ("ESLint", ["npm", "run", "lint"]),
        ("TypeScript", ["npm", "run", "typecheck"]),
        ("Pruebas", ["npm", "run", "test"]),
        ("Next.js build", ["npm", "run", "build"]),
    ]

    for name, command in stages:
        log.write(f"\n=== {name.upper()} ===")
        result = run(command, project, check=False, env=env)
        if result.returncode != 0:
            results[name] = "FALLÓ"
            raise AppError(f"La etapa {name} falló. Revisa {LOG_NAME}.")
        results[name] = "APROBADO"

    return results


def configure_git(project: Path) -> None:
    if not (project / ".git").exists():
        run(["git", "init"], project)

    run(["git", "branch", "-M", "main"], project)

    remote = run(["git", "remote", "get-url", "origin"], project, check=False)
    if remote.returncode == 0:
        run(["git", "remote", "set-url", "origin", REPO_URL], project)
    else:
        run(["git", "remote", "add", "origin", REPO_URL], project)

    if run(["git", "config", "user.name"], project, check=False).returncode != 0:
        run(["git", "config", "user.name", "Emanuel Rivera"], project)
    if run(["git", "config", "user.email"], project, check=False).returncode != 0:
        run(["git", "config", "user.email", "emannnuel55@gmail.com"], project)


def unstage_private_files(project: Path) -> None:
    # Retira del índice cualquier secreto, log o respaldo, incluso si alguna
    # versión anterior lo había publicado por error. No borra los archivos
    # locales del usuario.
    run(
        ["git", "rm", "-r", "--cached", "--ignore-unmatch", "--", *PRIVATE_PATHS],
        project,
        check=False,
    )


def commit_full_project(project: Path) -> None:
    configure_git(project)
    run(["git", "add", "-A"], project)
    unstage_private_files(project)

    diff = run(["git", "diff", "--cached", "--quiet"], project, check=False)
    if diff.returncode != 0:
        run(
            [
                "git",
                "commit",
                "-m",
                "feat: plataforma completa corregida validada y lista para Railway",
            ],
            project,
        )
    else:
        log.write("[INFO] No hay cambios nuevos para commit.")


def integrate_remote_safely(project: Path) -> None:
    fetch = run(["git", "fetch", "origin", "main"], project, check=False)
    if fetch.returncode != 0:
        output = (fetch.stdout or "").lower()
        if "couldn't find remote ref" in output or "could not find remote ref" in output:
            log.write("[INFO] El remoto no tiene main; se creará durante el push.")
            return
        raise AppError(
            "No pude consultar GitHub. Si aparece 407 Proxy Authentication Required, usa una red personal."
        )

    timestamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_branch = f"backup-remoto-antes-entrega-{timestamp}"

    # Se respalda el estado remoto antes de registrar la entrega completa.
    run(["git", "branch", backup_branch, "origin/main"], project, check=False)
    backup_push = run(
        ["git", "push", "origin", f"{backup_branch}:{backup_branch}"],
        project,
        check=False,
    )
    if backup_push.returncode == 0:
        log.write(f"[OK] Respaldo remoto creado: {backup_branch}")
    else:
        log.write("[AVISO] No se pudo publicar la rama de respaldo remoto; se conserva el respaldo ZIP local.")

    # Conecta los historiales pero conserva exactamente el árbol completo local.
    merge = run(
        [
            "git",
            "merge",
            "origin/main",
            "--allow-unrelated-histories",
            "--strategy=ours",
            "--no-edit",
        ],
        project,
        check=False,
    )
    if merge.returncode != 0:
        text = (merge.stdout or "").lower()
        if "already up to date" not in text:
            raise AppError("No se pudo integrar el historial remoto de forma segura.")


def push_to_github(project: Path) -> None:
    commit_full_project(project)
    integrate_remote_safely(project)

    push = run(["git", "push", "-u", "origin", "main"], project, check=False)
    if push.returncode != 0:
        raise AppError(
            "No se pudo subir a GitHub. Autoriza Git Credential Manager en el navegador o usa una red sin bloqueo 407."
        )

    log.write("[OK] GitHub actualizado correctamente.")
    webbrowser.open(REPO_WEB)


def write_report(project: Path, results: dict[str, str], success: bool, error: str = "") -> None:
    lines = [
        "LINOEM DEVELOPMENT",
        "PUNTO DE VENTA CELULARES",
        "REPORTE DE VALIDACIÓN LOCAL",
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
    print("=" * 72)
    print(" LINOEM DEVELOPMENT")
    print(" COMPILAR, VALIDAR Y ACTUALIZAR GITHUB")
    print("=" * 72)

    project = locate_project()
    log.bind(project)
    validate_structure(project)

    backup = create_backup(project)
    log.write(f"[OK] Respaldo local creado: {backup}")

    results: dict[str, str] = {}
    success = False
    error = ""

    try:
        if ask("¿Instalar dependencias, ejecutar todas las pruebas y compilar?"):
            results.update(compile_project(project))
        else:
            results["Validación"] = "OMITIDA POR EL USUARIO"

        if ask("¿Crear commit y actualizar GitHub con TODOS los archivos?"):
            push_to_github(project)
            results["GitHub"] = "ACTUALIZADO"
        else:
            results["GitHub"] = "OMITIDO POR EL USUARIO"

        success = True
    except Exception as exc:
        error = str(exc)
        log.write(f"\n[ERROR] {error}")

    write_report(project, results, success, error)

    if not success:
        raise AppError(f"El proceso terminó con errores. Revisa {project / LOG_NAME}")

    log.write("\nPROCESO TERMINADO CORRECTAMENTE")
    log.write(f"Proyecto: {project}")
    log.write(f"Reporte: {project / REPORT_NAME}")
    log.write("Railway iniciará un despliegue automático si el autodeploy está activado.")
    return 0


if __name__ == "__main__":
    exit_code = 0
    try:
        exit_code = main()
    except KeyboardInterrupt:
        print("\nProceso cancelado por el usuario.")
        exit_code = 130
    except Exception as exc:
        log.write(f"\n[ERROR FINAL] {exc}")
        exit_code = 1

    pause()
    raise SystemExit(exit_code)
