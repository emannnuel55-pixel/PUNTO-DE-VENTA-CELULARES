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

    for candidate in candidates:
        if all((candidate / marker).exists() for marker in PROJECT_MARKERS):
            return candidate

    fail(
        "No encontré el proyecto. Coloca este Python dentro de la carpeta que "
        "contiene package.json, app, components y prisma."
    )
    raise AssertionError


def main() -> None:
    print("=" * 68)
    print("  ACTUALIZADOR GITHUB + RAILWAY | PUNTO DE VENTA CELULARES")
    print("=" * 68)

    project = find_project()
    print(f"\nProyecto detectado: {project}")

    if shutil.which("git") is None:
        fail("Git no está instalado o no aparece en PATH.")
    if not (project / ".git").exists():
        fail(
            "La carpeta no contiene .git. Descarga/clona primero el repositorio "
            "desde GitHub Desktop y vuelve a colocar aquí este archivo."
        )

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

