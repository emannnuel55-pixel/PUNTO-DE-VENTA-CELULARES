# -*- coding: utf-8 -*-
r"""
REPARAR_DNS_Y_SUBIR_GITHUB.py

Diagnostica la conexión con GitHub y sube el proyecto usando HTTPS.

Coloca este archivo dentro de:
C:\xampp\htdocs\PUNTO-DE-VENTA-CELULARES-main

Repositorio:
https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git
"""

from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path


REMOTE = "https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git"
BRANCH = "main"
GIT_NAME = "Emanuel Rivera"
GIT_EMAIL = "emannnuel55@gmail.com"

SCRIPT_DIR = Path(__file__).resolve().parent


class AppError(RuntimeError):
    pass


def pause() -> None:
    try:
        input("\nPresiona ENTER para cerrar...")
    except EOFError:
        pass


def title(text: str) -> None:
    if os.name == "nt":
        os.system(f"title {text}")


def run(
    command: list[str],
    cwd: Path,
    *,
    check: bool = True,
    capture: bool = False,
) -> subprocess.CompletedProcess[str]:
    printable = " ".join(f'"{part}"' if " " in part else part for part in command)
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
        message = (result.stderr or result.stdout or "").strip()
        raise AppError(
            f"El comando terminó con código {result.returncode}."
            + (f"\n{message}" if message else "")
        )

    return result


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

    raise AppError(
        "No se encontró Git for Windows.\n"
        "Instala Git y vuelve a ejecutar este archivo."
    )


def detect_project() -> Path:
    candidates = [
        SCRIPT_DIR,
        SCRIPT_DIR / "PUNTO-DE-VENTA-CELULARES-main",
    ]

    for candidate in candidates:
        if (candidate / ".git").is_dir():
            return candidate

    for candidate in candidates:
        if not candidate.is_dir():
            continue

        if any(
            (candidate / name).exists()
            for name in ("package.json", "README.md", "src", "app", "public")
        ):
            return candidate

    raise AppError(
        "No se encontró el proyecto ni la carpeta .git.\n"
        "Coloca este archivo en la carpeta principal del proyecto."
    )


def resolve_github() -> bool:
    try:
        addresses = socket.getaddrinfo("github.com", 443, type=socket.SOCK_STREAM)
        unique_ips = sorted({item[4][0] for item in addresses})
        print(f"[OK] github.com resolvió a: {', '.join(unique_ips[:4])}")
        return True
    except socket.gaierror as error:
        print(f"[ERROR] Windows no puede resolver github.com: {error}")
        return False


def repair_dns() -> bool:
    print("\nComprobando DNS de Windows...")

    if resolve_github():
        return True

    print("\n[INFO] Limpiando la caché DNS de Windows...")
    subprocess.run(
        ["ipconfig", "/flushdns"],
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )

    time.sleep(2)

    if resolve_github():
        return True

    print("\n[INFO] Comprobando DNS con nslookup...")
    subprocess.run(
        ["nslookup", "github.com"],
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )

    print(
        "\nNo es un error del código ni de tu contraseña.\n"
        "Tu computadora o tu red no puede encontrar el dominio github.com.\n\n"
        "Haz estas comprobaciones:\n"
        "1. Abre https://github.com en Google Chrome.\n"
        "2. Desactiva temporalmente VPN o proxy si están bloqueando GitHub.\n"
        "3. Reinicia el módem o cambia a otra red, por ejemplo el hotspot del celular.\n"
        "4. En Windows puedes usar DNS 1.1.1.1 y 8.8.8.8.\n"
        "5. Después vuelve a ejecutar este mismo archivo."
    )

    return False


def configure_git(git: str, project: Path) -> None:
    if not (project / ".git").is_dir():
        run([git, "init"], project)

    run([git, "config", "user.name", GIT_NAME], project)
    run([git, "config", "user.email", GIT_EMAIL], project)
    run([git, "branch", "-M", BRANCH], project)

    remote = run(
        [git, "remote", "get-url", "origin"],
        project,
        check=False,
        capture=True,
    )

    if remote.returncode == 0:
        run([git, "remote", "set-url", "origin", REMOTE], project)
    else:
        run([git, "remote", "add", "origin", REMOTE], project)

    print("[OK] Git configurado para usar HTTPS.")


def protect_secrets(project: Path) -> None:
    gitignore = project / ".gitignore"
    rules = [
        ".env",
        ".env.*",
        "!.env.example",
        "node_modules/",
        ".next/",
        "dist/",
        "build/",
        "out/",
        "*.pem",
        "*.key",
        "*.p12",
        "*.pfx",
        "*.log",
    ]

    current = (
        gitignore.read_text(encoding="utf-8", errors="ignore")
        if gitignore.exists()
        else ""
    )
    current_lines = set(current.splitlines())

    missing = [rule for rule in rules if rule not in current_lines]

    if missing:
        with gitignore.open("a", encoding="utf-8", newline="\n") as file:
            if current and not current.endswith("\n"):
                file.write("\n")
            file.write("\n# Protección automática\n")
            file.write("\n".join(missing) + "\n")

    print("[OK] Archivos privados protegidos con .gitignore.")


def commit_pending_changes(git: str, project: Path) -> None:
    run([git, "add", "--all"], project)

    status = run(
        [git, "status", "--porcelain"],
        project,
        capture=True,
    )

    if not status.stdout.strip():
        print("[INFO] No hay cambios nuevos; se subirá el commit existente.")
        return

    message = f"Actualización automática {datetime.now():%Y-%m-%d %H:%M:%S}"
    run([git, "commit", "-m", message], project)
    print("[OK] Nuevo commit creado.")


def push(git: str, project: Path) -> None:
    print("\nSubiendo a GitHub mediante HTTPS...")

    result = run(
        [git, "push", "-u", "origin", BRANCH],
        project,
        check=False,
        capture=True,
    )

    if result.returncode == 0:
        print("\n[OK] PROYECTO SUBIDO CORRECTAMENTE.")
        return

    output = f"{result.stdout or ''}\n{result.stderr or ''}".lower()

    if "could not resolve host" in output:
        raise AppError(
            "La conexión DNS volvió a fallar durante la subida.\n"
            "Prueba otra red o el hotspot de tu celular y ejecuta nuevamente."
        )

    if any(
        text in output
        for text in (
            "non-fast-forward",
            "fetch first",
            "tip of your current branch is behind",
            "[rejected]",
        )
    ):
        print(
            "\n[AVISO] El repositorio remoto contiene archivos o commits diferentes."
        )
        answer = input(
            "Escribe REEMPLAZAR para sustituir la rama remota, "
            "o presiona ENTER para cancelar: "
        ).strip()

        if answer != "REEMPLAZAR":
            raise AppError(
                "Subida cancelada para no sobrescribir el repositorio remoto."
            )

        forced = run(
            [git, "push", "--force-with-lease", "-u", "origin", BRANCH],
            project,
            check=False,
            capture=True,
        )

        if forced.returncode == 0:
            print("\n[OK] Repositorio remoto actualizado correctamente.")
            return

        raise AppError(
            "GitHub rechazó la actualización forzada.\n"
            + (forced.stderr or forced.stdout or "")
        )

    if any(
        text in output
        for text in (
            "authentication failed",
            "repository not found",
            "403",
            "could not read username",
        )
    ):
        raise AppError(
            "GitHub no pudo autenticar la cuenta.\n"
            "Git Credential Manager debería abrir el navegador.\n"
            "Inicia sesión con la cuenta emannnuel55-pixel y vuelve a ejecutar."
        )

    raise AppError(
        "No se pudo completar la subida.\n"
        + (result.stderr or result.stdout or "Revisa el mensaje anterior.")
    )


def main() -> int:
    title("Reparar DNS y subir a GitHub")

    print("=" * 72)
    print(" REPARAR CONEXIÓN Y SUBIR PUNTO DE VENTA A GITHUB")
    print("=" * 72)

    try:
        project = detect_project()
        git = find_git()

        print(f"[OK] Proyecto: {project}")
        print(f"[OK] Git: {git}")

        if not repair_dns():
            return 2

        configure_git(git, project)
        protect_secrets(project)
        commit_pending_changes(git, project)
        push(git, project)

        print("\n" + "=" * 72)
        print(" SUBIDA TERMINADA")
        print(f" Repositorio: {REMOTE}")
        print(f" Rama: {BRANCH}")
        print("=" * 72)

        return 0

    except AppError as error:
        print("\n" + "=" * 72)
        print("[ERROR]")
        print(error)
        print("=" * 72)
        return 1

    except KeyboardInterrupt:
        print("\nOperación cancelada.")
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
