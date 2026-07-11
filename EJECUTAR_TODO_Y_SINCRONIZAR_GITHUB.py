#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# LINOEM DEVELOPMENT
# EJECUTAR TODO Y SINCRONIZAR GITHUB AUTOMÁTICAMENTE
#
# Proyecto principal:
# C:\Users\jesriver\Documents\PUNTO-DE-VENTA-CELULARES
#
# Este programa:
# - localiza el proyecto;
# - valida Node, npm y Git;
# - instala dependencias cuando sea necesario;
# - ejecuta Prisma, ESLint, TypeScript, pruebas y Next.js build;
# - crea commit y push solamente si todo aprueba;
# - vigila cambios y repite el proceso automáticamente;
# - excluye .env, secretos, node_modules, .next, respaldos y logs.
#
# Para detenerlo: Ctrl + C

from __future__ import annotations

import datetime as dt
import fnmatch
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

REPO_URL = "https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git"
BRANCH = "main"

PROJECT_CANDIDATES = [
    Path(r"C:\Users\jesriver\Documents\PUNTO-DE-VENTA-CELULARES"),
    Path(
        r"C:\Users\jesriver\Documents"
        r"\PUNTO-DE-VENTA-CELULARES-CORREGIDO-V3-WINDOWS"
        r"\PUNTO-DE-VENTA-CELULARES"
    ),
    Path(
        r"C:\Users\jesriver\Documents"
        r"\PUNTO-DE-VENTA-CELULARES-CORREGIDO-V2-WINDOWS"
        r"\PUNTO-DE-VENTA-CELULARES"
    ),
]

SEARCH_ROOTS = [
    Path(r"C:\Users\jesriver\Documents"),
    Path(r"C:\Users\jesriver\Desktop"),
    Path(r"C:\Users\jesriver\Downloads"),
]

POLL_SECONDS = 10
DEBOUNCE_SECONDS = 45

LOG_DIR = "_sync_logs"
LOG_FILE = "GITHUB_AUTO_SYNC.log"
STATE_FILE = ".github_auto_sync_state.json"
LOCK_FILE = ".github_auto_sync.lock"

EXCLUDED_DIRS = {
    ".git",
    ".next",
    "node_modules",
    "generated",
    "coverage",
    "_auto_backups",
    LOG_DIR,
    "__pycache__",
    ".cache",
    ".turbo",
}

SECRET_PATTERNS = [
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "*.p12",
    "*.pfx",
    "id_rsa",
    "id_rsa.*",
    "RAILWAY_VARIABLES_PRIVADAS.txt",
]

GITIGNORE_REQUIRED = [
    "node_modules/",
    ".next/",
    "generated/",
    "coverage/",
    "_auto_backups/",
    f"{LOG_DIR}/",
    STATE_FILE,
    LOCK_FILE,
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.production",
    ".env.production.local",
    "*.pem",
    "*.key",
    "*.p12",
    "*.pfx",
    "RAILWAY_VARIABLES_PRIVADAS.txt",
]


class SyncError(RuntimeError):
    pass


class Logger:
    def __init__(self) -> None:
        self.path: Path | None = None

    def bind(self, project: Path) -> None:
        folder = project / LOG_DIR
        folder.mkdir(parents=True, exist_ok=True)
        self.path = folder / LOG_FILE
        self.write("=" * 72)
        self.write("LINOEM DEVELOPMENT - SINCRONIZADOR GITHUB")
        self.write(f"Inicio: {dt.datetime.now().isoformat()}")
        self.write(f"Proyecto: {project}")
        self.write("=" * 72)

    def write(self, message: str = "") -> None:
        print(message, flush=True)
        if self.path:
            with self.path.open("a", encoding="utf-8") as handle:
                handle.write(message + "\n")


log = Logger()


@dataclass(frozen=True)
class Tool:
    name: str
    path: Path
    kind: str
    node_path: Path | None = None


TOOLS: dict[str, Tool] = {}


def first_existing(candidates: Iterable[Path | None]) -> Path | None:
    for item in candidates:
        if item and item.is_file():
            return item.resolve()
    return None


def resolve_tool(name: str) -> Tool:
    program_files = Path(os.environ.get("ProgramFiles", r"C:\Program Files"))
    node_dirs = [
        program_files / "nodejs",
        Path(r"C:\Program Files\nodejs"),
    ]

    found: list[Path] = []
    for candidate_name in (name, f"{name}.exe", f"{name}.cmd"):
        candidate = shutil.which(candidate_name)
        if candidate:
            found.append(Path(candidate))

    if name == "node":
        path = first_existing(
            [*found, *(folder / "node.exe" for folder in node_dirs)]
        )
        if not path:
            raise SyncError("No se encontró node.exe. Repara Node.js 22 LTS.")
        return Tool(name, path, "executable")

    if name in {"npm", "npx"}:
        node = TOOLS.get("node") or resolve_tool("node")
        node_dirs.insert(0, node.path.parent)

        cli_name = "npm-cli.js" if name == "npm" else "npx-cli.js"
        cli = first_existing(
            folder / "node_modules" / "npm" / "bin" / cli_name
            for folder in node_dirs
        )
        if cli:
            return Tool(name, cli, "node-script", node.path)

        cmd = first_existing(
            [*found, *(folder / f"{name}.cmd" for folder in node_dirs)]
        )
        if cmd:
            return Tool(name, cmd, "cmd", node.path)

        raise SyncError(f"No se encontró {name}. Repara Node.js 22 LTS.")

    if name == "git":
        path = first_existing(
            [
                *found,
                program_files / "Git" / "cmd" / "git.exe",
                Path(r"C:\Program Files\Git\cmd\git.exe"),
            ]
        )
        if not path:
            raise SyncError("No se encontró git.exe. Repara Git for Windows.")
        return Tool(name, path, "executable")

    raise SyncError(f"Herramienta no soportada: {name}")


def prepare_tools() -> None:
    for name in ("node", "npm", "npx", "git"):
        TOOLS[name] = resolve_tool(name)
        tool = TOOLS[name]
        log.write(f"[OK] {name}: {tool.path} [{tool.kind}]")


def build_command(tool_name: str, args: list[str]) -> list[str]:
    tool = TOOLS[tool_name]

    if tool.kind == "node-script":
        if not tool.node_path:
            raise SyncError(f"Falta node.exe para ejecutar {tool_name}.")
        return [str(tool.node_path), str(tool.path), *args]

    if tool.kind == "cmd":
        comspec = os.environ.get("COMSPEC", r"C:\Windows\System32\cmd.exe")
        return [comspec, "/d", "/s", "/c", "call", str(tool.path), *args]

    return [str(tool.path), *args]


def execute(
    command: list[str],
    cwd: Path,
    *,
    env: dict[str, str] | None = None,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    shown = subprocess.list2cmdline(command)
    log.write(f"\n$ {shown}")

    current_env = os.environ.copy()
    if env:
        current_env.update(env)

    process = subprocess.Popen(
        command,
        cwd=str(cwd),
        env=current_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        errors="replace",
        bufsize=1,
    )

    output: list[str] = []
    assert process.stdout is not None

    for line in process.stdout:
        cleaned = line.rstrip("\r\n")
        output.append(cleaned)
        log.write(cleaned)

    code = process.wait()
    result = subprocess.CompletedProcess(command, code, "\n".join(output), "")

    if check and code != 0:
        raise SyncError(f"Falló con código {code}: {shown}")

    return result


def run_tool(
    name: str,
    args: list[str],
    cwd: Path,
    *,
    env: dict[str, str] | None = None,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    return execute(build_command(name, args), cwd, env=env, check=check)


def git(
    project: Path,
    args: list[str],
    *,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    return run_tool("git", args, project, check=check)


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except Exception as exc:
        raise SyncError(f"No se pudo leer {path}: {exc}") from exc


def project_score(path: Path) -> int:
    package = path / "package.json"
    if not package.is_file():
        return -1

    try:
        data = read_json(package)
    except SyncError:
        return -1

    score = 80 if data.get("name") == "punto-de-venta-celulares" else 0

    expected = [
        "package-lock.json",
        "app/page.tsx",
        "app/api/health/route.ts",
        "lib/db.ts",
        "prisma/schema.prisma",
        "Dockerfile",
        "railway.json",
        "scripts/start-railway.mjs",
    ]
    score += sum(10 for item in expected if (path / item).exists())

    config = path / ".git" / "config"
    if config.is_file():
        text = config.read_text(encoding="utf-8", errors="ignore")
        if "PUNTO-DE-VENTA-CELULARES".lower() in text.lower():
            score += 60

    return score


def search_projects(root: Path) -> list[tuple[int, Path]]:
    if not root.exists():
        return []

    results: list[tuple[int, Path]] = []
    root_depth = len(root.parts)

    for current, dirs, files in os.walk(root):
        path = Path(current)
        dirs[:] = [
            folder
            for folder in dirs
            if folder not in EXCLUDED_DIRS
            and folder not in {"AppData", "$Recycle.Bin", "System Volume Information"}
        ]

        if len(path.parts) - root_depth > 8:
            dirs[:] = []
            continue

        if "package.json" not in files:
            continue

        score = project_score(path)
        if score >= 140:
            results.append((score, path))
            dirs[:] = []

    return results


def locate_project() -> Path:
    script_dir = Path(__file__).resolve().parent
    if project_score(script_dir) >= 140:
        return script_dir

    for candidate in PROJECT_CANDIDATES:
        if project_score(candidate) >= 140:
            return candidate

    matches: list[tuple[int, Path]] = []
    for root in SEARCH_ROOTS:
        log.write(f"[INFO] Buscando en: {root}")
        matches.extend(search_projects(root))

    if not matches:
        raise SyncError(
            "No se encontró el proyecto. Coloca este Python dentro de "
            r"C:\Users\jesriver\Documents\PUNTO-DE-VENTA-CELULARES."
        )

    matches.sort(key=lambda item: item[0], reverse=True)
    return matches[0][1]


def validate_project(project: Path) -> None:
    required = [
        "package.json",
        "package-lock.json",
        "app/page.tsx",
        "app/api/health/route.ts",
        "lib/db.ts",
        "prisma/schema.prisma",
        "Dockerfile",
        "railway.json",
        "scripts/start-railway.mjs",
    ]
    missing = [item for item in required if not (project / item).exists()]
    if missing:
        raise SyncError("El proyecto está incompleto. Faltan: " + ", ".join(missing))


def merge_gitignore(project: Path) -> None:
    path = project / ".gitignore"
    lines: list[str] = []

    if path.exists():
        lines = path.read_text(encoding="utf-8-sig", errors="ignore").splitlines()

    existing = {line.strip() for line in lines if line.strip()}
    changed = False

    for item in GITIGNORE_REQUIRED:
        if item not in existing:
            lines.append(item)
            existing.add(item)
            changed = True

    if changed:
        path.write_text(
            "\n".join(lines).rstrip() + "\n",
            encoding="utf-8",
            newline="\n",
        )
        log.write("[OK] .gitignore protegido.")


def is_secret(relative: str) -> bool:
    normalized = relative.replace("\\", "/")
    filename = normalized.rsplit("/", 1)[-1]

    if filename == ".env.example":
        return False

    return any(
        fnmatch.fnmatch(filename.lower(), pattern.lower())
        or fnmatch.fnmatch(normalized.lower(), pattern.lower())
        for pattern in SECRET_PATTERNS
    )


def snapshot(project: Path) -> dict[str, tuple[int, int]]:
    result: dict[str, tuple[int, int]] = {}

    for current, dirs, files in os.walk(project):
        current_path = Path(current)
        dirs[:] = [folder for folder in dirs if folder not in EXCLUDED_DIRS]

        for name in files:
            path = current_path / name
            relative = path.relative_to(project)

            if relative.name in {STATE_FILE, LOCK_FILE}:
                continue
            if is_secret(relative.as_posix()):
                continue

            try:
                stat = path.stat()
            except OSError:
                continue

            result[relative.as_posix()] = (stat.st_mtime_ns, stat.st_size)

    return result


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def load_state(project: Path) -> dict:
    path = project / STATE_FILE
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_state(project: Path, state: dict) -> None:
    (project / STATE_FILE).write_text(
        json.dumps(state, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def acquire_lock(project: Path) -> Path:
    path = project / LOCK_FILE

    if path.exists():
        try:
            previous_pid = int(path.read_text(encoding="utf-8").strip())
            os.kill(previous_pid, 0)
        except Exception:
            pass
        else:
            raise SyncError(
                f"Ya existe otra sincronización activa con PID {previous_pid}."
            )

    path.write_text(str(os.getpid()), encoding="utf-8")
    return path


def build_env() -> dict[str, str]:
    return {
        "DATABASE_URL": (
            "postgresql://postgres:postgres@127.0.0.1:5432/"
            "punto_venta?schema=public"
        ),
        "SESSION_SECRET": (
            "local-build-session-secret-2026-minimum-48-characters-safe-value"
        ),
        "ACCESS_CODE_SECRET": (
            "local-build-access-secret-2026-minimum-48-characters-safe-value"
        ),
        "NEXT_PUBLIC_APP_NAME": "PUNTO DE VENTA CELULARES",
        "NEXT_PUBLIC_COMPANY_NAME": "LINOEM DEVELOPMENT",
        "NEXT_TELEMETRY_DISABLED": "1",
        "NODE_OPTIONS": "--max-old-space-size=3072",
        "NPM_CONFIG_AUDIT": "false",
        "NPM_CONFIG_FUND": "false",
        "NPM_CONFIG_UPDATE_NOTIFIER": "false",
        "NPM_CONFIG_MAXSOCKETS": "8",
        "CI": "1",
    }


def verify_versions(project: Path) -> None:
    env = build_env()
    node = run_tool("node", ["--version"], project, env=env).stdout.strip()
    npm = run_tool("npm", ["--version"], project, env=env).stdout.strip()
    version_git = run_tool("git", ["--version"], project, env=env).stdout.strip()
    log.write(f"[INFO] Node: {node}")
    log.write(f"[INFO] npm: {npm}")
    log.write(f"[INFO] Git: {version_git}")


def install_dependencies(project: Path, state: dict) -> None:
    package_hash = sha256(project / "package.json")
    lock_hash = sha256(project / "package-lock.json")

    must_install = (
        not (project / "node_modules").is_dir()
        or state.get("package_json") != package_hash
        or state.get("package_lock") != lock_hash
    )

    if not must_install:
        log.write("[INFO] Dependencias sin cambios; se omite npm ci.")
        return

    log.write("\n=== NPM CI ===")
    result = run_tool(
        "npm",
        ["ci", "--no-audit", "--no-fund", "--prefer-online"],
        project,
        env=build_env(),
        check=False,
    )

    if result.returncode != 0:
        log.write("[AVISO] Reintentando npm ci después de limpiar node_modules.")
        shutil.rmtree(project / "node_modules", ignore_errors=True)
        result = run_tool(
            "npm",
            ["ci", "--no-audit", "--no-fund", "--prefer-online"],
            project,
            env=build_env(),
            check=False,
        )

    if result.returncode != 0:
        raise SyncError("npm ci falló después de dos intentos.")

    state["package_json"] = package_hash
    state["package_lock"] = lock_hash
    save_state(project, state)


def validate_code(project: Path) -> None:
    package = read_json(project / "package.json")
    scripts = set(package.get("scripts", {}).keys())

    stages = [
        ("PRISMA", "db:generate"),
        ("ESLINT", "lint"),
        ("TYPESCRIPT", "typecheck"),
        ("PRUEBAS", "test"),
        ("NEXT BUILD", "build"),
    ]

    for label, script_name in stages:
        if script_name not in scripts:
            raise SyncError(f"Falta el script npm: {script_name}")

        log.write(f"\n=== {label} ===")
        result = run_tool(
            "npm",
            ["run", script_name],
            project,
            env=build_env(),
            check=False,
        )

        if result.returncode != 0:
            raise SyncError(
                f"{label} falló. No se realizará commit ni push."
            )

        log.write(f"[OK] {label}: APROBADO")


def configure_git(project: Path) -> None:
    if not (project / ".git").is_dir():
        git(project, ["init"])

    git(project, ["branch", "-M", BRANCH])

    remote = git(project, ["remote", "get-url", "origin"], check=False)
    if remote.returncode == 0:
        git(project, ["remote", "set-url", "origin", REPO_URL])
    else:
        git(project, ["remote", "add", "origin", REPO_URL])

    if git(project, ["config", "user.name"], check=False).returncode != 0:
        git(project, ["config", "user.name", "Emanuel Rivera"])

    if git(project, ["config", "user.email"], check=False).returncode != 0:
        git(project, ["config", "user.email", "emannnuel55@gmail.com"])


def unstage_secrets(project: Path) -> None:
    tracked = git(project, ["ls-files"], check=False)
    for relative in tracked.stdout.splitlines():
        relative = relative.strip()
        if relative and is_secret(relative):
            git(
                project,
                ["rm", "--cached", "--ignore-unmatch", "--", relative],
                check=False,
            )
            log.write(f"[SEGURIDAD] Excluido del repositorio: {relative}")

    staged = git(
        project,
        ["diff", "--cached", "--name-only"],
        check=False,
    )
    for relative in staged.stdout.splitlines():
        relative = relative.strip()
        if relative and is_secret(relative):
            git(project, ["reset", "--", relative], check=False)
            log.write(f"[SEGURIDAD] No se subirá: {relative}")


def commit_changes(project: Path) -> bool:
    git(project, ["add", "-A"])
    unstage_secrets(project)

    changed = git(
        project,
        ["diff", "--cached", "--quiet"],
        check=False,
    ).returncode != 0

    if not changed:
        log.write("[INFO] No hay cambios nuevos para commit.")
        return False

    names = git(
        project,
        ["diff", "--cached", "--name-only"],
        check=False,
    ).stdout.splitlines()

    message = (
        "chore: actualización automática validada "
        f"({len(names)} archivos) {dt.datetime.now():%Y-%m-%d %H:%M:%S}"
    )
    git(project, ["commit", "-m", message])
    log.write(f"[OK] Commit: {message}")
    return True


def integrate_remote(project: Path) -> None:
    fetch = git(project, ["fetch", "origin", BRANCH], check=False)

    if fetch.returncode != 0:
        output = fetch.stdout.lower()

        if "couldn't find remote ref" in output or "could not find remote ref" in output:
            return

        if "407" in output or "proxy authentication required" in output:
            raise SyncError(
                "El proxy corporativo bloqueó GitHub. "
                "Conecta esta PC al hotspot del teléfono."
            )

        raise SyncError("No se pudo consultar origin/main.")

    rebase = git(project, ["rebase", f"origin/{BRANCH}"], check=False)
    if rebase.returncode != 0:
        git(project, ["rebase", "--abort"], check=False)
        raise SyncError(
            "Existe un conflicto con GitHub. Se canceló sin sobrescribir archivos."
        )


def push_github(project: Path) -> None:
    result = git(
        project,
        ["push", "-u", "origin", BRANCH],
        check=False,
    )

    if result.returncode == 0:
        log.write("[OK] GITHUB ACTUALIZADO.")
        return

    output = result.stdout.lower()

    if "407" in output or "proxy authentication required" in output:
        raise SyncError(
            "El proxy corporativo bloqueó el push. "
            "Conecta la PC al hotspot del teléfono."
        )

    if "authentication failed" in output:
        raise SyncError(
            "GitHub requiere autorización. Inicia sesión en GitHub Desktop "
            "o completa Git Credential Manager."
        )

    raise SyncError("git push falló. Revisa el log.")


def synchronize(project: Path, reason: str) -> None:
    started = time.time()
    log.write("")
    log.write("=" * 72)
    log.write(f"SINCRONIZACIÓN: {reason}")
    log.write(f"Hora: {dt.datetime.now():%Y-%m-%d %H:%M:%S}")
    log.write("=" * 72)

    state = load_state(project)
    install_dependencies(project, state)
    validate_code(project)

    if not commit_changes(project):
        log.write("[OK] Proyecto validado y sin cambios pendientes.")
        return

    integrate_remote(project)
    push_github(project)

    state["last_success"] = dt.datetime.now().isoformat()
    save_state(project, state)
    log.write(f"[OK] Finalizado en {time.time() - started:.1f} segundos.")


def monitor(project: Path) -> None:
    log.write("")
    log.write("=" * 72)
    log.write("MONITOREO ACTIVO")
    log.write(f"Revisa cada {POLL_SECONDS} segundos.")
    log.write(
        f"Ejecuta validación y push después de "
        f"{DEBOUNCE_SECONDS} segundos sin cambios."
    )
    log.write("Presiona Ctrl + C para detener.")
    log.write("=" * 72)

    previous = snapshot(project)
    pending_since: float | None = None

    while True:
        time.sleep(POLL_SECONDS)
        current = snapshot(project)

        if current != previous:
            previous = current
            pending_since = time.time()
            log.write(
                f"[CAMBIO] Detectado a las {dt.datetime.now():%H:%M:%S}."
            )
            continue

        if pending_since is None:
            continue

        if time.time() - pending_since < DEBOUNCE_SECONDS:
            continue

        pending_since = None

        try:
            synchronize(project, "cambios detectados")
        except Exception as exc:
            log.write(f"[ERROR] {exc}")
            log.write("[INFO] El monitoreo continúa esperando la siguiente corrección.")

        previous = snapshot(project)


def main() -> int:
    print("=" * 72)
    print(" LINOEM DEVELOPMENT")
    print(" EJECUTAR TODO Y SINCRONIZAR GITHUB")
    print("=" * 72)

    project = locate_project()
    log.bind(project)
    log.write(f"[OK] Proyecto: {project}")

    validate_project(project)
    lock = acquire_lock(project)

    try:
        merge_gitignore(project)
        prepare_tools()
        verify_versions(project)
        configure_git(project)

        synchronize(project, "validación inicial")
        monitor(project)
    finally:
        lock.unlink(missing_ok=True)

    return 0


if __name__ == "__main__":
    exit_code = 0

    try:
        exit_code = main()
    except KeyboardInterrupt:
        log.write("\n[INFO] Monitoreo detenido por el usuario.")
    except Exception as exc:
        log.write(f"\n[ERROR FINAL] {exc}")
        exit_code = 1

    try:
        input("\nPresiona ENTER para cerrar...")
    except EOFError:
        pass

    raise SystemExit(exit_code)
