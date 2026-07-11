# -*- coding: utf-8 -*-
"""
SUBIR_A_GITHUB.py
Sube automáticamente el proyecto local a GitHub.

Proyecto:
C:\xampp\htdocs\PUNTO-DE-VENTA-CELULARES-main\PUNTO-DE-VENTA-CELULARES-main

Repositorio:
git@github.com:emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git
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

PROJECT_DIR = Path(
    r"C:\xampp\htdocs\PUNTO-DE-VENTA-CELULARES-main\PUNTO-DE-VENTA-CELULARES-main"
)

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
    "# Caché y archivos temporales",
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
    "# Editores y sistema operativo",
    ".idea/",
    ".vscode/",
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    "",
    "# Base de datos local",
    "*.sqlite",
    "*.sqlite3",
    "*.db",
    "",
    "# Archivos comprimidos o respaldos pesados",
    "*.zip",
    "*.rar",
    "*.7z",
    "*.bak",
]


class GitError(RuntimeError):
    """Error controlado al ejecutar Git."""


def set_console_title(title: str) -> None:
    if os.name == "nt":
        os.system(f"title {title}")


def print_header() -> None:
    print("=" * 72)
    print(" LINOEM DEVELOPMENT - SUBIDA AUTOMÁTICA A GITHUB")
    print("=" * 72)
    print(f"Proyecto : {PROJECT_DIR}")
    print(f"GitHub   : {REMOTE_SSH}")
    print(f"Rama     : {BRANCH}")
    print("=" * 72)
    print()


def pause() -> None:
    try:
        input("\nPresiona ENTER para cerrar...")
    except EOFError:
        pass


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
        "No se encontró Git. Instala Git for Windows y vuelve a ejecutar este archivo."
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
        if result.stdout.strip():
            print(result.stdout.rstrip())
        if result.stderr.strip():
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


def validate_project() -> None:
    if not PROJECT_DIR.exists():
        raise GitError(f"No existe la carpeta:\n{PROJECT_DIR}")

    if not PROJECT_DIR.is_dir():
        raise GitError(f"La ruta no es una carpeta:\n{PROJECT_DIR}")

    items = [
        item
        for item in PROJECT_DIR.iterdir()
        if item.name not in {".git", "__pycache__"}
    ]

    if not items:
        raise GitError("La carpeta del proyecto está vacía.")

    print("[OK] Carpeta del proyecto encontrada.")


def update_gitignore() -> None:
    gitignore = PROJECT_DIR / ".gitignore"
    existing = gitignore.read_text(encoding="utf-8", errors="ignore") if gitignore.exists() else ""

    new_rules = []
    for rule in GITIGNORE_RULES:
        if not rule:
            new_rules.append(rule)
        elif rule.startswith("#") or rule not in existing.splitlines():
            new_rules.append(rule)

    if new_rules:
        with gitignore.open("a", encoding="utf-8", newline="\n") as handle:
            if existing and not existing.endswith("\n"):
                handle.write("\n")
            handle.write("\n# Reglas agregadas por SUBIR_A_GITHUB.py\n")
            handle.write("\n".join(new_rules).rstrip() + "\n")

    print("[OK] .gitignore protegido y actualizado.")


def scan_large_files() -> None:
    excluded_dirs = {
        ".git",
        "node_modules",
        ".next",
        "dist",
        "build",
        "out",
        "__pycache__",
    }

    oversized: list[tuple[Path, float]] = []

    for root, dirs, files in os.walk(PROJECT_DIR):
        dirs[:] = [d for d in dirs if d not in excluded_dirs]

        for filename in files:
            path = Path(root) / filename
            try:
                size_mb = path.stat().st_size / (1024 * 1024)
            except OSError:
                continue

            if size_mb > MAX_FILE_SIZE_MB:
                oversized.append((path, size_mb))

    if oversized:
        print("\n[ERROR] GitHub no acepta normalmente archivos mayores a 100 MB.")
        for path, size_mb in oversized:
            print(f" - {path.relative_to(PROJECT_DIR)} ({size_mb:.2f} MB)")
        raise GitError(
            "Retira o comprime fuera del proyecto los archivos indicados antes de subir."
        )

    print(f"[OK] No hay archivos mayores a {MAX_FILE_SIZE_MB} MB.")


def git_has_commits(git: str) -> bool:
    result = run(
        [git, "rev-parse", "--verify", "HEAD"],
        cwd=PROJECT_DIR,
        check=False,
        capture=True,
    )
    return result.returncode == 0


def remote_branch_exists(git: str) -> bool:
    result = run(
        [git, "ls-remote", "--exit-code", "--heads", "origin", BRANCH],
        cwd=PROJECT_DIR,
        check=False,
        capture=True,
    )
    return result.returncode == 0


def configure_repository(git: str) -> None:
    git_dir = PROJECT_DIR / ".git"

    if not git_dir.exists():
        run([git, "init"], cwd=PROJECT_DIR)
        print("[OK] Repositorio Git inicializado.")
    else:
        print("[OK] La carpeta ya contiene un repositorio Git.")

    run([git, "config", "user.name", GIT_USER_NAME], cwd=PROJECT_DIR)
    run([git, "config", "user.email", GIT_USER_EMAIL], cwd=PROJECT_DIR)
    run([git, "config", "core.autocrlf", "true"], cwd=PROJECT_DIR)

    current_remote = run(
        [git, "remote", "get-url", "origin"],
        cwd=PROJECT_DIR,
        check=False,
        capture=True,
    )

    if current_remote.returncode == 0:
        run([git, "remote", "set-url", "origin", REMOTE_SSH], cwd=PROJECT_DIR)
    else:
        run([git, "remote", "add", "origin", REMOTE_SSH], cwd=PROJECT_DIR)

    run([git, "branch", "-M", BRANCH], cwd=PROJECT_DIR)
    print("[OK] Repositorio y rama configurados.")


def choose_remote_protocol(git: str) -> None:
    print("\nComprobando acceso por SSH...")
    test = run(
        [git, "ls-remote", "origin"],
        cwd=PROJECT_DIR,
        check=False,
        capture=True,
    )

    if test.returncode == 0:
        print("[OK] Conexión SSH con GitHub correcta.")
        return

    output = f"{test.stdout}\n{test.stderr}".lower()

    if "permission denied" in output or "publickey" in output:
        print("\n[AVISO] GitHub rechazó la llave SSH.")
        print("[INFO] Cambiando automáticamente a HTTPS.")
        run([git, "remote", "set-url", "origin", REMOTE_HTTPS], cwd=PROJECT_DIR)

        print(
            "[INFO] Git Credential Manager puede abrir el navegador para iniciar sesión."
        )

        test_https = run(
            [git, "ls-remote", "origin"],
            cwd=PROJECT_DIR,
            check=False,
            capture=True,
        )

        if test_https.returncode != 0:
            raise GitError(
                "No fue posible autenticar con GitHub por SSH ni por HTTPS.\n"
                "Inicia sesión cuando Git Credential Manager lo solicite y vuelve a ejecutar."
            )

        print("[OK] Conexión HTTPS con GitHub correcta.")
        return

    print(
        "[AVISO] No fue posible comprobar el remoto en este momento. "
        "Se intentará continuar con la subida."
    )


def untrack_sensitive_files(git: str) -> None:
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
    ]

    for pattern in patterns:
        run(
            [git, "rm", "-r", "--cached", "--ignore-unmatch", pattern],
            cwd=PROJECT_DIR,
            check=False,
            capture=True,
        )

    print("[OK] Archivos privados y carpetas generadas excluidos del seguimiento.")


def stage_and_commit(git: str) -> None:
    run([git, "add", "--all"], cwd=PROJECT_DIR)

    status = run(
        [git, "status", "--porcelain"],
        cwd=PROJECT_DIR,
        capture=True,
    )

    if not status.stdout.strip():
        print("\n[INFO] No hay cambios nuevos para crear un commit.")
        return

    message = f"Actualización automática LINOEM {datetime.now():%Y-%m-%d %H:%M:%S}"
    run([git, "commit", "-m", message], cwd=PROJECT_DIR)
    print("[OK] Commit creado correctamente.")


def push_repository(git: str) -> None:
    print("\nSubiendo cambios a GitHub...")

    result = run(
        [git, "push", "-u", "origin", BRANCH],
        cwd=PROJECT_DIR,
        check=False,
        capture=True,
    )

    if result.returncode == 0:
        print("\n[OK] PROYECTO SUBIDO CORRECTAMENTE A GITHUB.")
        return

    output = f"{result.stdout}\n{result.stderr}".lower()

    non_fast_forward = any(
        text in output
        for text in (
            "non-fast-forward",
            "fetch first",
            "rejected",
            "tip of your current branch is behind",
        )
    )

    if non_fast_forward:
        print("\n[AVISO] El repositorio remoto contiene cambios diferentes.")
        print(
            "La opción segura es cancelar y revisar los cambios.\n"
            "También puedes reemplazar el contenido remoto usando --force-with-lease."
        )

        answer = input(
            '\nEscribe exactamente "REEMPLAZAR" para sobrescribir la rama remota: '
        ).strip()

        if answer != "REEMPLAZAR":
            raise GitError(
                "Subida cancelada para evitar sobrescribir información existente."
            )

        force_result = run(
            [git, "push", "--force-with-lease", "-u", "origin", BRANCH],
            cwd=PROJECT_DIR,
            check=False,
            capture=True,
        )

        if force_result.returncode != 0:
            raise GitError(
                "GitHub rechazó la subida forzada.\n"
                + (force_result.stderr or force_result.stdout or "")
            )

        print("\n[OK] El repositorio remoto fue actualizado correctamente.")
        return

    raise GitError(
        "No fue posible subir el proyecto.\n"
        + (result.stderr or result.stdout or "Revisa la salida mostrada.")
    )


def show_summary(git: str) -> None:
    remote = run(
        [git, "remote", "get-url", "origin"],
        cwd=PROJECT_DIR,
        capture=True,
    ).stdout.strip()

    commit = run(
        [git, "log", "-1", "--pretty=format:%h - %s"],
        cwd=PROJECT_DIR,
        check=False,
        capture=True,
    ).stdout.strip()

    print("\n" + "=" * 72)
    print(" RESULTADO")
    print("=" * 72)
    print(f"Proyecto : {PROJECT_DIR}")
    print(f"Remoto   : {remote}")
    print(f"Rama     : {BRANCH}")
    print(f"Commit   : {commit or 'Sin commits nuevos'}")
    print("Estado   : SUBIDA FINALIZADA")
    print("=" * 72)


def main() -> int:
    set_console_title("LINOEM - Subir proyecto a GitHub")
    print_header()

    try:
        validate_project()
        git = find_git()
        print(f"[OK] Git encontrado: {git}")

        update_gitignore()
        scan_large_files()
        configure_repository(git)
        choose_remote_protocol(git)
        untrack_sensitive_files(git)
        stage_and_commit(git)
        push_repository(git)
        show_summary(git)
        return 0

    except GitError as exc:
        print("\n" + "=" * 72)
        print("[ERROR]")
        print(str(exc))
        print("=" * 72)
        return 1

    except KeyboardInterrupt:
        print("\n\n[INFO] Operación cancelada por el usuario.")
        return 130

    except Exception as exc:
        print("\n" + "=" * 72)
        print("[ERROR INESPERADO]")
        print(f"{type(exc).__name__}: {exc}")
        print("=" * 72)
        return 1

    finally:
        pause()


if __name__ == "__main__":
    sys.exit(main())
