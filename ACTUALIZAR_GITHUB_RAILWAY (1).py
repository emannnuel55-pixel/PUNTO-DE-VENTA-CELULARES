#!/usr/bin/env python3
"""Actualiza el proyecto Punto de Venta Celulares en GitHub.

Coloca este archivo dentro de la carpeta raíz del proyecto, donde se encuentra
package.json, y ejecútalo con doble clic o desde una terminal.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


PROJECT_MARKERS = ("package.json", "app", "components", "prisma")
DEFAULT_BRANCH = "main"
DEFAULT_REMOTE = "https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git"
EXCLUDED_COPY_PARTS = {".git", "node_modules", ".next", "__pycache__"}


def pause() -> None:
    if sys.platform == "win32":
        input("\nPresiona ENTER para cerrar...")


def fail(message: str) -> None:
    print(f"\n[ERROR] {message}")
    pause()
    raise SystemExit(1)


def run(command: list[str], cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    print(f"\n> {' '.join(command)}")
    result = subprocess.run(
        command,
        cwd=cwd,
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    if result.stdout.strip():
        print(result.stdout.strip())
    if check and result.returncode != 0:
        fail(f"El comando terminó con código {result.returncode}.")
    return result


def find_project() -> Path:
    script_dir = Path(__file__).resolve().parent
    candidates = [script_dir, Path.cwd().resolve()]

    # También permite dejar el script junto a una carpeta descomprimida.
    for base in list(candidates):
        if base.is_dir():
            candidates.extend(p for p in base.iterdir() if p.is_dir())

    # Busca hasta dentro de las carpetas descargadas, sin recorrer dependencias.
    for base in {script_dir, Path.cwd().resolve()}:
        for package_file in base.glob("*/*/package.json"):
            if not any(part in EXCLUDED_COPY_PARTS for part in package_file.parts):
                candidates.append(package_file.parent)

    for candidate in candidates:
        if all((candidate / marker).exists() for marker in PROJECT_MARKERS):
            return candidate

    fail(
        "No encontré el proyecto. Coloca este Python dentro de la carpeta que "
        "contiene package.json, app, components y prisma."
    )
    raise AssertionError


def copy_project(source: Path, destination: Path) -> None:
    """Copia el código corregido sin tocar la identidad Git del clon."""
    print(f"\nCopiando versión responsive a: {destination}")
    for item in source.rglob("*"):
        relative = item.relative_to(source)
        if any(part in EXCLUDED_COPY_PARTS for part in relative.parts):
            continue
        target = destination / relative
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        elif item.is_file():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)


def obtain_repository(source: Path) -> Path:
    if (source / ".git").exists():
        return source

    print("\n[AVISO] La carpeta descargada no tiene .git.")
    print("El actualizador clonará automáticamente el repositorio correcto.")
    target = Path.home() / "Documents" / "GitHub" / "PUNTO-DE-VENTA-CELULARES"
    target.parent.mkdir(parents=True, exist_ok=True)

    if (target / ".git").exists():
        print(f"Repositorio clonado encontrado: {target}")
    elif target.exists() and any(target.iterdir()):
        fail(
            f"Ya existe una carpeta sin conexión Git en {target}. Cámbiale el "
            "nombre o muévela y ejecuta nuevamente el actualizador."
        )
    else:
        run(["git", "clone", DEFAULT_REMOTE, str(target)], target.parent)

    copy_project(source, target)
    return target


def main() -> None:
    print("=" * 68)
    print("  ACTUALIZADOR GITHUB + RAILWAY | PUNTO DE VENTA CELULARES")
    print("=" * 68)

    source_project = find_project()
    print(f"\nProyecto detectado: {source_project}")

    if shutil.which("git") is None:
        fail("Git no está instalado o no aparece en PATH.")
    project = obtain_repository(source_project)

    remote = run(["git", "remote", "get-url", "origin"], project).stdout.strip()
    print(f"Repositorio remoto: {remote}")
    if "PUNTO-DE-VENTA-CELULARES" not in remote.upper():
        answer = input("\nEl nombre remoto no coincide claramente. ¿Continuar? [s/N]: ").strip().lower()
        if answer not in {"s", "si", "sí", "y", "yes"}:
            fail("Actualización cancelada para proteger otro repositorio.")

    # Evita mezclar cambios con una actualización remota inesperada.
    run(["git", "fetch", "origin", DEFAULT_BRANCH], project)
    branch = run(["git", "branch", "--show-current"], project).stdout.strip()
    if branch != DEFAULT_BRANCH:
        run(["git", "switch", DEFAULT_BRANCH], project)

    divergence = run(
        ["git", "rev-list", "--left-right", "--count", f"HEAD...origin/{DEFAULT_BRANCH}"],
        project,
    ).stdout.strip().split()
    if len(divergence) == 2 and int(divergence[1]) > 0:
        fail(
            "GitHub tiene cambios nuevos que esta carpeta aún no tiene. Abre "
            "GitHub Desktop, usa Pull origin y ejecuta nuevamente el actualizador."
        )

    run(["git", "add", "--all"], project)
    staged = run(["git", "diff", "--cached", "--quiet"], project, check=False)
    if staged.returncode == 0:
        print("\n[OK] No hay cambios nuevos para subir. GitHub ya está actualizado.")
        pause()
        return
    if staged.returncode != 1:
        fail("No fue posible revisar los cambios preparados.")

    stamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    message = f"Actualización responsive automática {stamp}"
    run(["git", "commit", "-m", message], project)
    run(["git", "push", "origin", DEFAULT_BRANCH], project)

    print("\n" + "=" * 68)
    print("[LISTO] Proyecto actualizado correctamente en GitHub.")
    print("Railway iniciará el despliegue automático conectado a la rama main.")
    print("Revisa Railway en unos minutos para confirmar que el deployment esté ACTIVE.")
    print("=" * 68)
    pause()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        fail("Proceso cancelado por el usuario.")
