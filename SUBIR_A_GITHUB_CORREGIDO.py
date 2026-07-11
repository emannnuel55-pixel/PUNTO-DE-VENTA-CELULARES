# -*- coding: utf-8 -*-
r"""
SUBIR_A_GITHUB_CORREGIDO.py

Sube automáticamente el proyecto a GitHub.

Repositorio:
git@github.com:emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git

Este archivo puede ejecutarse desde:
C:\xampp\htdocs\PUNTO-DE-VENTA-CELULARES-main
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


# ============================================================
# CONFIGURACIÓN
# ============================================================

SCRIPT_DIR = Path(__file__).resolve().parent

REMOTE_SSH = "git@github.com:emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git"
REMOTE_HTTPS = "https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git"

BRANCH = "main"
GIT_USER_NAME = "Emanuel Rivera"
GIT_USER_EMAIL = "emannnuel55@gmail.com"

MAX_FILE_SIZE_MB = 95

GITIGNORE_RULES = [
    "# Dependencias",
    "node_modules/",
    "",
    "# Variables privadas y secretos",
    ".env",
    ".env.*",
    "!.env.example",
    "*.pem",
    "*.key",
    "*.p12",
    "*.pfx",
    "",
    "# Compilaciones",
    ".next/",
    "dist/",
    "build/",
    "out/",
    "coverage/",
    "",
    "# Caché y temporales",
    "__pycache__/",
    "*.py[cod]",
    ".pytest_cache/",
    ".cache/",
    "*.log",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    "pnpm-debug.log*",
    "",
    "# Editores y sistema",
    ".idea/",
    ".vscode/",
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    "",
    "# Bases de datos locales",
    "*.sqlite",
    "*.sqlite3",
    "*.db",
    "",
    "# Comprimidos y respaldos",
    "*.zip",
    "*.rar",
    "*.7z",
    "*.bak",
]


class GitError(RuntimeError):
    pass


def pause() -> None:
    try:
        input("\nPresiona ENTER para cerrar...")
    except EOFError:
        pass


def set_console_title(title: str) -> None:
    if os.name == "nt":
        os.system(f"title {title}")


def detect_project_dir() -> Path:
    """
    Detecta automáticamente si el proyecto está:
    1) directamente junto al archivo Python, o
    2) dentro de una subcarpeta PUNTO-DE-VENTA-CELULARES-main.
    """

    candidates = [
        SCRIPT_DIR,
        SCRIPT_DIR / "PUNTO-DE-VENTA-CELULARES-main",
    ]

    important_files = {
        "package.json",
        "README.md",
        "next.config.js",
        "next.config.mjs",
        "vite.config.js",
        "vite.config.ts",
    }

    for candidate in candidates:
        if not candidate.exists() or not candidate.is_dir():
            continue

        names = {item.name for item in candidate.iterdir()}
        if names.intersection(important_files):
            return candidate

        if any((candidate / folder).exists() for folder in ("src", "app", "public")):
            return candidate

    raise GitError(
        "No se encontró el proyecto.\n\n"
        "Coloca este archivo Python en:\n"
        r"C:\xampp\htdocs\PUNTO-DE-VENTA-CELULARES-main"
        "\n\ny verifica que ahí mismo, o dentro de la subcarpeta "
        "'PUNTO-DE-VENTA-CELULARES-main', estén package.json, src, app o public."
    )


def find_git() -> str:
    candidates = [
        shutil.which("git"),
        r"C:\Program Files\Git\cmd\git.exe",
        r"C:\Program Files\Git\bin\git.exe",
        r"C:\Program Files (x86)\Git\cmd\git.exe",
    ]

    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(candidate)

    raise GitError(
        "No se encontró Git.\n"
        "Instala Git for Windows y vuelve a ejecutar este archivo."
    )


def run(
    command: list[str],
    *,
    cwd: Path,
    check: bool = True,
    capture: bool = False,
) -> subprocess.CompletedProcess[str]:
    printable = " ".join(f'"{item}"' if " " in item else item for item in command)
    print(f"\n> {printable}")

    result = subprocess.run(
        command,
        cwd=str(cwd),
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
        shell=False,
    )

    if capture:
        if result.stdout and result.stdout.strip():
            print(result.stdout.rstrip())
        if result.stderr and result.stderr.strip():
            print(result.stderr.rstrip())

    if check and result.returncode != 0:
        details = ""
        if capture:
            details = (result.stderr or result.stdout or "").strip()

        raise GitError(
            f"El comando terminó con código {result.returncode}."
            + (f"\n{details}" if details else "")
        )

    return result


def update_gitignore(project_dir: Path) -> None:
    gitignore = project_dir / ".gitignore"

    existing = (
        gitignore.read_text(encoding="utf-8", errors="ignore")
        if gitignore.exists()
        else ""
    )

    existing_lines = set(existing.splitlines())
    lines_to_add = []

    for rule in GITIGNORE_RULES:
        if rule == "":
            lines_to_add.append("")
        elif rule.startswith("#") or rule not in existing_lines:
            lines_to_add.append(rule)

    if lines_to_add:
        with gitignore.open("a", encoding="utf-8", newline="\n") as handle:
            if existing and not existing.endswith("\n"):
                handle.write("\n")

            handle.write("\n# Reglas agregadas por SUBIR_A_GITHUB_CORREGIDO.py\n")
            handle.write("\n".join(lines_to_add).rstrip() + "\n")

    print("[OK] .gitignore actualizado.")


def scan_large_files(project_dir: Path) -> None:
    excluded_dirs = {
        ".git",
        "node_modules",
        ".next",
        "dist",
        "build",
        "out",
        "__pycache__",
    }

    oversized = []

    for root, dirs, files in os.walk(project_dir):
        dirs[:] = [directory for directory in dirs if directory not in excluded_dirs]

        for filename in files:
            path = Path(root) / filename

            try:
                size_mb = path.stat().st_size / (1024 * 1024)
            except OSError:
                continue

            if size_mb > MAX_FILE_SIZE_MB:
                oversized.append((path, size_mb))

    if oversized:
        print("\n[ERROR] Se encontraron archivos demasiado grandes:")

        for path, size_mb in oversized:
            print(f" - {path.relative_to(project_dir)} ({size_mb:.2f} MB)")

        raise GitError(
            "GitHub no acepta normalmente archivos mayores a 100 MB.\n"
            "Retira esos archivos y vuelve a ejecutar."
        )

    print(f"[OK] No hay archivos mayores a {MAX_FILE_SIZE_MB} MB.")


def configure_repository(git: str, project_dir: Path) -> None:
    if not (project_dir / ".git").exists():
        run([git, "init"], cwd=project_dir)
        print("[OK] Repositorio Git inicializado.")
    else:
        print("[OK] El proyecto ya contiene un repositorio Git.")

    run([git, "config", "user.name", GIT_USER_NAME], cwd=project_dir)
    run([git, "config", "user.email", GIT_USER_EMAIL], cwd=project_dir)
    run([git, "config", "core.autocrlf", "true"], cwd=project_dir)

    remote_result = run(
        [git, "remote", "get-url", "origin"],
        cwd=project_dir,
        check=False,
        capture=True,
    )

    if remote_result.returncode == 0:
        run([git, "remote", "set-url", "origin", REMOTE_SSH], cwd=project_dir)
    else:
        run([git, "remote", "add", "origin", REMOTE_SSH], cwd=project_dir)

    run([git, "branch", "-M", BRANCH], cwd=project_dir)

    print("[OK] Repositorio, usuario, remoto y rama configurados.")


def test_and_select_remote(git: str, project_dir: Path) -> None:
    print("\nComprobando acceso a GitHub por SSH...")

    ssh_result = run(
        [git, "ls-remote", "origin"],
        cwd=project_dir,
        check=False,
        capture=True,
    )

    if ssh_result.returncode == 0:
        print("[OK] Conexión SSH correcta.")
        return

    combined_output = (
        f"{ssh_result.stdout or ''}\n{ssh_result.stderr or ''}"
    ).lower()

    if "permission denied" in combined_output or "publickey" in combined_output:
        print("\n[AVISO] GitHub rechazó la llave SSH.")
        print("[INFO] Se cambiará automáticamente a HTTPS.")

        run(
            [git, "remote", "set-url", "origin", REMOTE_HTTPS],
            cwd=project_dir,
        )

        https_result = run(
            [git, "ls-remote", "origin"],
            cwd=project_dir,
            check=False,
            capture=True,
        )

        if https_result.returncode != 0:
            raise GitError(
                "No se pudo autenticar con GitHub.\n"
                "Git Credential Manager puede abrir el navegador para iniciar sesión.\n"
                "Después vuelve a ejecutar este archivo."
            )

        print("[OK] Conexión HTTPS correcta.")
        return

    print(
        "[AVISO] No se pudo comprobar el remoto, "
        "pero se continuará con la subida."
    )


def untrack_sensitive_files(git: str, project_dir: Path) -> None:
    patterns = [
        ".env",
        ".env.local",
        ".env.development",
        ".env.production",
        ".env.test",
        "*.pem",
        "*.key",
        "*.p12",
        "*.pfx",
        "node_modules",
        ".next",
        "dist",
        "build",
        "out",
    ]

    for pattern in patterns:
        run(
            [git, "rm", "-r", "--cached", "--ignore-unmatch", pattern],
            cwd=project_dir,
            check=False,
            capture=True,
        )

    print("[OK] Archivos privados y generados excluidos del repositorio.")


def stage_and_commit(git: str, project_dir: Path) -> None:
    run([git, "add", "--all"], cwd=project_dir)

    status = run(
        [git, "status", "--porcelain"],
        cwd=project_dir,
        capture=True,
    )

    if not status.stdout.strip():
        print("[INFO] No hay cambios nuevos para crear un commit.")
        return

    message = f"Actualización automática {datetime.now():%Y-%m-%d %H:%M:%S}"

    run([git, "commit", "-m", message], cwd=project_dir)

    print("[OK] Commit creado correctamente.")


def push_to_github(git: str, project_dir: Path) -> None:
    print("\nSubiendo el proyecto a GitHub...")

    result = run(
        [git, "push", "-u", "origin", BRANCH],
        cwd=project_dir,
        check=False,
        capture=True,
    )

    if result.returncode == 0:
        print("\n[OK] PROYECTO SUBIDO CORRECTAMENTE A GITHUB.")
        return

    combined_output = (
        f"{result.stdout or ''}\n{result.stderr or ''}"
    ).lower()

    conflict_messages = (
        "non-fast-forward",
        "fetch first",
        "tip of your current branch is behind",
        "[rejected]",
    )

    if any(message in combined_output for message in conflict_messages):
        print("\n[AVISO] El repositorio remoto ya contiene otros cambios.")
        print("Para proteger tu información, no se sobrescribirá automáticamente.")

        answer = input(
            '\nEscribe exactamente REEMPLAZAR para sustituir el contenido remoto: '
        ).strip()

        if answer != "REEMPLAZAR":
            raise GitError(
                "Subida cancelada para no sobrescribir el repositorio remoto."
            )

        force_result = run(
            [git, "push", "--force-with-lease", "-u", "origin", BRANCH],
            cwd=project_dir,
            check=False,
            capture=True,
        )

        if force_result.returncode != 0:
            raise GitError(
                "GitHub rechazó la subida forzada.\n"
                + (force_result.stderr or force_result.stdout or "")
            )

        print("\n[OK] Repositorio remoto reemplazado correctamente.")
        return

    raise GitError(
        "No se pudo subir el proyecto.\n"
        + (result.stderr or result.stdout or "Revisa la salida mostrada.")
    )


def show_summary(git: str, project_dir: Path) -> None:
    remote = run(
        [git, "remote", "get-url", "origin"],
        cwd=project_dir,
        capture=True,
    ).stdout.strip()

    commit = run(
        [git, "log", "-1", "--pretty=format:%h - %s"],
        cwd=project_dir,
        check=False,
        capture=True,
    ).stdout.strip()

    print("\n" + "=" * 72)
    print(" SUBIDA FINALIZADA")
    print("=" * 72)
    print(f"Proyecto : {project_dir}")
    print(f"Remoto   : {remote}")
    print(f"Rama     : {BRANCH}")
    print(f"Commit   : {commit or 'Sin cambios nuevos'}")
    print("=" * 72)


def main() -> int:
    set_console_title("Subir Punto de Venta Celulares a GitHub")

    print("=" * 72)
    print(" SUBIR PUNTO DE VENTA CELULARES A GITHUB")
    print("=" * 72)

    try:
        project_dir = detect_project_dir()
        print(f"[OK] Proyecto detectado: {project_dir}")

        git = find_git()
        print(f"[OK] Git encontrado: {git}")

        update_gitignore(project_dir)
        scan_large_files(project_dir)
        configure_repository(git, project_dir)
        test_and_select_remote(git, project_dir)
        untrack_sensitive_files(git, project_dir)
        stage_and_commit(git, project_dir)
        push_to_github(git, project_dir)
        show_summary(git, project_dir)

        return 0

    except GitError as error:
        print("\n" + "=" * 72)
        print("[ERROR]")
        print(error)
        print("=" * 72)
        return 1

    except KeyboardInterrupt:
        print("\n[INFO] Operación cancelada.")
        return 130

    except Exception as error:
        print("\n" + "=" * 72)
        print("[ERROR INESPERADO]")
        print(f"{type(error).__name__}: {error}")
        print("=" * 72)
        return 1

    finally:
        pause()


if __name__ == "__main__":
    sys.exit(main())
