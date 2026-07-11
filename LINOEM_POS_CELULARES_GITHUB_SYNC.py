# -*- coding: utf-8 -*-
r"""
LINOEM_POS_CELULARES_GITHUB_SYNC.py

Sincronizador visual para subir el proyecto:
PUNTO DE VENTA DE CELULARES

Repositorio:
https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git

No guarda contraseñas ni tokens. Utiliza Git Credential Manager
o la autenticación SSH/HTTPS ya configurada en Windows.
"""

from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
import threading
import tkinter as tk
import webbrowser
from datetime import datetime
from pathlib import Path
from tkinter import filedialog, messagebox, ttk


# ============================================================
# CONFIGURACIÓN PRINCIPAL
# ============================================================

DEFAULT_PROJECT = r"C:\xampp\htdocs\PUNTO-DE-VENTA-CELULARES-main"
DEFAULT_REPOSITORY = (
    "https://github.com/emannnuel55-pixel/"
    "PUNTO-DE-VENTA-CELULARES.git"
)
DEFAULT_REPOSITORY_SSH = (
    "git@github.com:emannnuel55-pixel/"
    "PUNTO-DE-VENTA-CELULARES.git"
)
DEFAULT_BRANCH = "main"
DEFAULT_GIT_NAME = "Emanuel Rivera"
DEFAULT_GIT_EMAIL = "emannnuel55@gmail.com"

GITHUB_PAGE = (
    "https://github.com/emannnuel55-pixel/"
    "PUNTO-DE-VENTA-CELULARES"
)

APP_TITLE = "LINOEM POS CELULARES · GITHUB SYNC"

MAX_FILE_SIZE_MB = 95

PROJECT_MARKERS = (
    "package.json",
    "README.md",
    "server.js",
    "src",
    "app",
    "public",
    "index.html",
    "composer.json",
)

GITIGNORE_RULES = [
    "# Dependencias",
    "node_modules/",
    "vendor/",
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
    "# Sistema y editores",
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
    "# Respaldos y comprimidos",
    "*.zip",
    "*.rar",
    "*.7z",
    "*.bak",
]


def locate_git() -> str | None:
    """Busca Git en PATH y en las rutas comunes de Windows."""
    candidates = [
        shutil.which("git"),
        r"C:\Program Files\Git\cmd\git.exe",
        r"C:\Program Files\Git\bin\git.exe",
        r"C:\Program Files (x86)\Git\cmd\git.exe",
    ]

    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(candidate)

    return None


def run_command(
    command: list[str],
    cwd: Path,
) -> tuple[int, str]:
    """Ejecuta un comando sin abrir otra ventana de consola."""
    process = subprocess.run(
        command,
        cwd=str(cwd),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        encoding="utf-8",
        errors="replace",
        creationflags=(
            subprocess.CREATE_NO_WINDOW
            if os.name == "nt"
            else 0
        ),
        check=False,
    )
    return process.returncode, process.stdout.strip()


class GitHubUploader(tk.Tk):
    def __init__(self) -> None:
        super().__init__()

        self.title(APP_TITLE)
        self.geometry("980x720")
        self.minsize(840, 610)
        self.configure(bg="#07111f")

        self.git_executable = locate_git()

        self.project_var = tk.StringVar(value=DEFAULT_PROJECT)
        self.repo_var = tk.StringVar(value=DEFAULT_REPOSITORY)
        self.branch_var = tk.StringVar(value=DEFAULT_BRANCH)
        self.status_var = tk.StringVar(
            value="Listo para verificar y subir."
        )
        self.force_var = tk.BooleanVar(value=False)

        self._configure_style()
        self._build_ui()

    # ========================================================
    # INTERFAZ
    # ========================================================

    def _configure_style(self) -> None:
        style = ttk.Style(self)

        try:
            style.theme_use("clam")
        except tk.TclError:
            pass

        style.configure(
            "App.TFrame",
            background="#07111f",
        )
        style.configure(
            "Panel.TFrame",
            background="#0d1b2d",
        )
        style.configure(
            "Title.TLabel",
            background="#07111f",
            foreground="#f4f8ff",
            font=("Segoe UI", 21, "bold"),
        )
        style.configure(
            "Subtitle.TLabel",
            background="#07111f",
            foreground="#9fb7d7",
            font=("Segoe UI", 10),
        )
        style.configure(
            "PanelTitle.TLabel",
            background="#0d1b2d",
            foreground="#eef7ff",
            font=("Segoe UI", 10, "bold"),
        )
        style.configure(
            "Status.TLabel",
            background="#07111f",
            foreground="#35d7ff",
            font=("Segoe UI", 10, "bold"),
        )
        style.configure(
            "Accent.TButton",
            font=("Segoe UI", 10, "bold"),
            padding=(16, 10),
            foreground="#ffffff",
            background="#1268e8",
        )
        style.map(
            "Accent.TButton",
            background=[
                ("active", "#1884ff"),
                ("disabled", "#41546a"),
            ],
        )
        style.configure(
            "Secondary.TButton",
            font=("Segoe UI", 10),
            padding=(14, 9),
        )
        style.configure(
            "App.TCheckbutton",
            background="#0d1b2d",
            foreground="#e6f0ff",
            font=("Segoe UI", 9),
        )
        style.map(
            "App.TCheckbutton",
            background=[("active", "#0d1b2d")],
            foreground=[("active", "#ffffff")],
        )

    def _build_ui(self) -> None:
        root = ttk.Frame(self, style="App.TFrame", padding=24)
        root.pack(fill="both", expand=True)

        header = ttk.Frame(root, style="App.TFrame")
        header.pack(fill="x")

        ttk.Label(
            header,
            text="LINOEM POS CELULARES",
            style="Title.TLabel",
        ).pack(anchor="w")

        ttk.Label(
            header,
            text=(
                "Sincronizador visual para verificar, preparar y subir "
                "el Punto de Venta de Celulares a GitHub."
            ),
            style="Subtitle.TLabel",
        ).pack(anchor="w", pady=(5, 18))

        panel = ttk.Frame(
            root,
            style="Panel.TFrame",
            padding=18,
        )
        panel.pack(fill="x")

        ttk.Label(
            panel,
            text="CARPETA DEL PROYECTO",
            style="PanelTitle.TLabel",
        ).grid(
            row=0,
            column=0,
            sticky="w",
            pady=(0, 6),
        )

        project_entry = ttk.Entry(
            panel,
            textvariable=self.project_var,
            font=("Segoe UI", 10),
        )
        project_entry.grid(
            row=1,
            column=0,
            sticky="ew",
            padx=(0, 10),
        )

        ttk.Button(
            panel,
            text="Examinar...",
            style="Secondary.TButton",
            command=self.choose_folder,
        ).grid(row=1, column=1)

        ttk.Label(
            panel,
            text="REPOSITORIO GITHUB",
            style="PanelTitle.TLabel",
        ).grid(
            row=2,
            column=0,
            sticky="w",
            pady=(15, 6),
        )

        ttk.Entry(
            panel,
            textvariable=self.repo_var,
            font=("Segoe UI", 10),
        ).grid(
            row=3,
            column=0,
            columnspan=2,
            sticky="ew",
        )

        ttk.Label(
            panel,
            text="RAMA",
            style="PanelTitle.TLabel",
        ).grid(
            row=4,
            column=0,
            sticky="w",
            pady=(15, 6),
        )

        ttk.Entry(
            panel,
            textvariable=self.branch_var,
            width=20,
            font=("Segoe UI", 10),
        ).grid(
            row=5,
            column=0,
            sticky="w",
        )

        ttk.Checkbutton(
            panel,
            text=(
                "Permitir reemplazar la rama remota si GitHub "
                "rechaza la actualización"
            ),
            variable=self.force_var,
            style="App.TCheckbutton",
        ).grid(
            row=6,
            column=0,
            columnspan=2,
            sticky="w",
            pady=(15, 0),
        )

        panel.columnconfigure(0, weight=1)

        actions = ttk.Frame(root, style="App.TFrame")
        actions.pack(fill="x", pady=18)

        self.upload_button = ttk.Button(
            actions,
            text="VERIFICAR, CORREGIR Y SUBIR",
            style="Accent.TButton",
            command=self.start_upload,
        )
        self.upload_button.pack(side="left")

        ttk.Button(
            actions,
            text="Abrir repositorio",
            style="Secondary.TButton",
            command=lambda: webbrowser.open(GITHUB_PAGE),
        ).pack(side="left", padx=10)

        ttk.Button(
            actions,
            text="Usar URL SSH",
            style="Secondary.TButton",
            command=self.use_ssh,
        ).pack(side="left")

        ttk.Label(
            root,
            textvariable=self.status_var,
            style="Status.TLabel",
        ).pack(anchor="w", pady=(0, 8))

        log_frame = ttk.Frame(
            root,
            style="Panel.TFrame",
            padding=2,
        )
        log_frame.pack(fill="both", expand=True)

        self.log = tk.Text(
            log_frame,
            wrap="word",
            bg="#050b14",
            fg="#d7e8ff",
            insertbackground="#ffffff",
            selectbackground="#1268e8",
            relief="flat",
            borderwidth=0,
            font=("Consolas", 10),
            padx=14,
            pady=14,
        )
        self.log.pack(
            side="left",
            fill="both",
            expand=True,
        )

        scrollbar = ttk.Scrollbar(
            log_frame,
            orient="vertical",
            command=self.log.yview,
        )
        scrollbar.pack(side="right", fill="y")
        self.log.configure(yscrollcommand=scrollbar.set)
        self.log.configure(state="disabled")

        self.write_log(
            "Proyecto predeterminado:\n"
            f"{DEFAULT_PROJECT}\n\n"
            "Repositorio:\n"
            f"{DEFAULT_REPOSITORY}\n"
        )

    def choose_folder(self) -> None:
        folder = filedialog.askdirectory(
            initialdir=(
                self.project_var.get()
                or str(Path.home())
            )
        )
        if folder:
            self.project_var.set(folder)

    def use_ssh(self) -> None:
        self.repo_var.set(DEFAULT_REPOSITORY_SSH)
        self.write_log(
            "\n[INFO] Se seleccionó la URL SSH.\n"
            "Requiere una llave SSH configurada en GitHub."
        )

    # ========================================================
    # ACTUALIZACIONES SEGURAS DE TKINTER
    # ========================================================

    def write_log(self, text: str) -> None:
        self.after(0, self._write_log_ui, text)

    def _write_log_ui(self, text: str) -> None:
        self.log.configure(state="normal")
        self.log.insert("end", text.rstrip() + "\n")
        self.log.see("end")
        self.log.configure(state="disabled")

    def set_status(self, text: str) -> None:
        self.after(0, self.status_var.set, text)

    def show_info(self, title: str, text: str) -> None:
        self.after(
            0,
            lambda: messagebox.showinfo(title, text),
        )

    def show_error(self, title: str, text: str) -> None:
        self.after(
            0,
            lambda: messagebox.showerror(title, text),
        )

    def set_button_enabled(self, enabled: bool) -> None:
        state = "normal" if enabled else "disabled"
        self.after(
            0,
            lambda: self.upload_button.configure(state=state),
        )

    # ========================================================
    # VALIDACIONES
    # ========================================================

    def detect_real_project(self, selected: Path) -> Path:
        candidates = [
            selected,
            selected / "PUNTO-DE-VENTA-CELULARES-main",
        ]

        for candidate in candidates:
            if not candidate.is_dir():
                continue

            if any(
                (candidate / marker).exists()
                for marker in PROJECT_MARKERS
            ):
                return candidate

            if (candidate / ".git").is_dir():
                return candidate

        raise RuntimeError(
            "La carpeta seleccionada no parece contener el proyecto.\n\n"
            "Debe tener archivos o carpetas como:\n"
            "package.json, src, app, public, server.js o README.md."
        )

    def validate_dns(self) -> None:
        self.write_log(
            "\n[Conexión] Comprobando acceso DNS a github.com..."
        )

        try:
            addresses = socket.getaddrinfo(
                "github.com",
                443,
                type=socket.SOCK_STREAM,
            )
            ips = sorted(
                {item[4][0] for item in addresses}
            )
            self.write_log(
                "[OK] github.com respondió: "
                + ", ".join(ips[:3])
            )
        except socket.gaierror as exc:
            if os.name == "nt":
                self.write_log(
                    "[INFO] Limpiando caché DNS de Windows..."
                )
                subprocess.run(
                    ["ipconfig", "/flushdns"],
                    text=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    encoding="utf-8",
                    errors="replace",
                    creationflags=subprocess.CREATE_NO_WINDOW,
                    check=False,
                )

            try:
                socket.getaddrinfo(
                    "github.com",
                    443,
                    type=socket.SOCK_STREAM,
                )
                self.write_log(
                    "[OK] DNS reparado después de limpiar la caché."
                )
            except socket.gaierror:
                raise RuntimeError(
                    "Windows no puede encontrar github.com.\n\n"
                    "Esto es un problema de Internet o DNS, "
                    "no del proyecto.\n\n"
                    "Prueba abrir GitHub en Chrome, reiniciar el módem "
                    "o usar temporalmente el hotspot del celular."
                ) from exc

    def update_gitignore(self, project: Path) -> None:
        gitignore = project / ".gitignore"

        current = (
            gitignore.read_text(
                encoding="utf-8",
                errors="ignore",
            )
            if gitignore.exists()
            else ""
        )

        current_lines = set(current.splitlines())
        missing = []

        for rule in GITIGNORE_RULES:
            if rule == "":
                missing.append("")
            elif rule.startswith("#") or rule not in current_lines:
                missing.append(rule)

        if missing:
            with gitignore.open(
                "a",
                encoding="utf-8",
                newline="\n",
            ) as handle:
                if current and not current.endswith("\n"):
                    handle.write("\n")

                handle.write(
                    "\n# Protección agregada por "
                    "LINOEM_POS_CELULARES_GITHUB_SYNC.py\n"
                )
                handle.write(
                    "\n".join(missing).rstrip() + "\n"
                )

        self.write_log(
            "[OK] .gitignore revisado y protegido."
        )

    def scan_large_files(self, project: Path) -> None:
        excluded = {
            ".git",
            "node_modules",
            "vendor",
            ".next",
            "dist",
            "build",
            "out",
            "__pycache__",
        }

        oversized: list[tuple[Path, float]] = []

        for root, directories, filenames in os.walk(project):
            directories[:] = [
                directory
                for directory in directories
                if directory not in excluded
            ]

            for filename in filenames:
                path = Path(root) / filename

                try:
                    size_mb = (
                        path.stat().st_size
                        / (1024 * 1024)
                    )
                except OSError:
                    continue

                if size_mb > MAX_FILE_SIZE_MB:
                    oversized.append((path, size_mb))

        if oversized:
            details = "\n".join(
                f"- {path.relative_to(project)} "
                f"({size:.2f} MB)"
                for path, size in oversized
            )
            raise RuntimeError(
                "Se encontraron archivos demasiado grandes "
                "para GitHub:\n\n"
                f"{details}\n\n"
                "Retíralos del proyecto y vuelve a intentar."
            )

        self.write_log(
            f"[OK] No hay archivos mayores a "
            f"{MAX_FILE_SIZE_MB} MB."
        )

    # ========================================================
    # PROCESO DE SUBIDA
    # ========================================================

    def start_upload(self) -> None:
        self.upload_button.configure(state="disabled")
        self.status_var.set("Procesando proyecto...")
        threading.Thread(
            target=self.upload,
            daemon=True,
        ).start()

    def execute_step(
        self,
        label: str,
        command: list[str],
        project: Path,
        required: bool = True,
    ) -> tuple[int, str]:
        self.write_log(
            f"\n[{label}]\n"
            + " ".join(command)
        )

        code, output = run_command(command, project)

        if output:
            self.write_log(output)

        if required and code != 0:
            raise RuntimeError(
                f"Falló el paso: {label}"
            )

        return code, output

    def upload(self) -> None:
        try:
            selected = Path(
                self.project_var.get()
            ).expanduser().resolve()

            repository = self.repo_var.get().strip()
            branch = (
                self.branch_var.get().strip()
                or DEFAULT_BRANCH
            )

            if not selected.is_dir():
                raise RuntimeError(
                    "La carpeta seleccionada no existe."
                )

            if not repository:
                raise RuntimeError(
                    "Debes escribir la URL del repositorio."
                )

            if not self.git_executable:
                raise RuntimeError(
                    "Git no está instalado o Windows no lo encuentra.\n"
                    "Instala Git for Windows y vuelve a ejecutar."
                )

            project = self.detect_real_project(selected)

            self.set_status(
                "Proyecto detectado. Preparando Git..."
            )
            self.write_log(
                "\n" + "=" * 70
                + "\nINICIANDO SINCRONIZACIÓN\n"
                + "=" * 70
            )
            self.write_log(
                f"[OK] Proyecto real: {project}"
            )
            self.write_log(
                f"[OK] Git: {self.git_executable}"
            )
            self.write_log(
                f"[OK] Repositorio: {repository}"
            )
            self.write_log(
                f"[OK] Rama: {branch}"
            )

            self.validate_dns()
            self.update_gitignore(project)
            self.scan_large_files(project)

            git = self.git_executable

            self.execute_step(
                "Verificando Git",
                [git, "--version"],
                project,
            )

            if not (project / ".git").is_dir():
                self.execute_step(
                    "Inicializando repositorio",
                    [git, "init"],
                    project,
                )
            else:
                self.write_log(
                    "\n[OK] El proyecto ya contiene .git"
                )

            self.execute_step(
                "Configurando autor",
                [
                    git,
                    "config",
                    "user.name",
                    DEFAULT_GIT_NAME,
                ],
                project,
            )
            self.execute_step(
                "Configurando correo",
                [
                    git,
                    "config",
                    "user.email",
                    DEFAULT_GIT_EMAIL,
                ],
                project,
            )
            self.execute_step(
                "Configurando rama principal",
                [git, "branch", "-M", branch],
                project,
            )

            remote_code, _ = run_command(
                [git, "remote", "get-url", "origin"],
                project,
            )

            if remote_code == 0:
                self.execute_step(
                    "Actualizando repositorio remoto",
                    [
                        git,
                        "remote",
                        "set-url",
                        "origin",
                        repository,
                    ],
                    project,
                )
            else:
                self.execute_step(
                    "Agregando repositorio remoto",
                    [
                        git,
                        "remote",
                        "add",
                        "origin",
                        repository,
                    ],
                    project,
                )

            self.set_status(
                "Consultando historial remoto..."
            )

            remote_branch_code, remote_output = (
                self.execute_step(
                    "Consultando rama remota",
                    [
                        git,
                        "ls-remote",
                        "--exit-code",
                        "--heads",
                        "origin",
                        branch,
                    ],
                    project,
                    required=False,
                )
            )

            if remote_branch_code == 0:
                self.execute_step(
                    "Descargando historial remoto",
                    [
                        git,
                        "fetch",
                        "origin",
                        branch,
                    ],
                    project,
                )

                self.execute_step(
                    "Preparando actualización segura",
                    [
                        git,
                        "reset",
                        "--mixed",
                        "FETCH_HEAD",
                    ],
                    project,
                )

                self.write_log(
                    "[OK] Los archivos locales se conservaron "
                    "y el commit remoto se tomó como base."
                )

            elif remote_branch_code == 2:
                self.write_log(
                    f"[INFO] La rama remota {branch} "
                    "todavía no existe."
                )
            else:
                lower_output = remote_output.lower()

                if (
                    "permission denied" in lower_output
                    or "publickey" in lower_output
                ):
                    raise RuntimeError(
                        "GitHub rechazó la llave SSH.\n\n"
                        "Pulsa nuevamente y usa la URL HTTPS:\n"
                        f"{DEFAULT_REPOSITORY}"
                    )

                raise RuntimeError(
                    "No fue posible consultar GitHub.\n\n"
                    "Verifica Internet, acceso al repositorio "
                    "y autenticación."
                )

            self.set_status(
                "Preparando archivos del proyecto..."
            )

            # Retirar secretos que pudieron estar rastreados antes.
            sensitive_patterns = (
                ".env",
                ".env.local",
                ".env.production",
                ".env.development",
                "node_modules",
                ".next",
                "dist",
                "build",
                "out",
            )

            for pattern in sensitive_patterns:
                run_command(
                    [
                        git,
                        "rm",
                        "-r",
                        "--cached",
                        "--ignore-unmatch",
                        pattern,
                    ],
                    project,
                )

            self.execute_step(
                "Agregando archivos",
                [git, "add", "-A"],
                project,
            )

            _, status_output = self.execute_step(
                "Revisando cambios",
                [git, "status", "--short"],
                project,
                required=False,
            )

            diff_code, _ = run_command(
                [
                    git,
                    "diff",
                    "--cached",
                    "--quiet",
                ],
                project,
            )

            if diff_code != 0:
                commit_message = (
                    "Punto de Venta Celulares funcional "
                    f"{datetime.now():%Y-%m-%d %H:%M}"
                )

                self.execute_step(
                    "Creando commit",
                    [
                        git,
                        "commit",
                        "-m",
                        commit_message,
                    ],
                    project,
                )
            else:
                self.write_log(
                    "\n[OK] No hay cambios nuevos "
                    "para crear un commit."
                )

            self.set_status(
                "Subiendo archivos a GitHub..."
            )

            push_code, push_output = self.execute_step(
                "Subiendo a GitHub",
                [
                    git,
                    "push",
                    "-u",
                    "origin",
                    branch,
                ],
                project,
                required=False,
            )

            if push_code != 0:
                lower_push = push_output.lower()

                conflict = any(
                    text in lower_push
                    for text in (
                        "non-fast-forward",
                        "fetch first",
                        "tip of your current branch is behind",
                        "[rejected]",
                    )
                )

                if conflict and self.force_var.get():
                    self.write_log(
                        "\n[AVISO] Aplicando "
                        "--force-with-lease..."
                    )

                    force_code, force_output = (
                        self.execute_step(
                            "Reemplazando rama remota",
                            [
                                git,
                                "push",
                                "--force-with-lease",
                                "-u",
                                "origin",
                                branch,
                            ],
                            project,
                            required=False,
                        )
                    )

                    if force_code != 0:
                        raise RuntimeError(
                            "GitHub rechazó la subida forzada.\n"
                            f"{force_output}"
                        )

                elif conflict:
                    raise RuntimeError(
                        "GitHub tiene cambios diferentes.\n\n"
                        "Activa la casilla para permitir "
                        "reemplazar la rama remota y vuelve a intentar."
                    )

                elif (
                    "could not resolve host" in lower_push
                    or "could not resolve hostname" in lower_push
                ):
                    raise RuntimeError(
                        "La red no pudo encontrar github.com.\n\n"
                        "Prueba otra conexión o el hotspot del celular."
                    )

                elif (
                    "authentication failed" in lower_push
                    or "could not read username" in lower_push
                    or "repository not found" in lower_push
                    or "403" in lower_push
                ):
                    raise RuntimeError(
                        "GitHub no pudo autenticar la cuenta.\n\n"
                        "Inicia sesión en la ventana del navegador "
                        "que abra Git Credential Manager y vuelve a intentar."
                    )

                else:
                    raise RuntimeError(
                        "GitHub rechazó la subida.\n\n"
                        f"{push_output}"
                    )

            self.set_status(
                "Subida completada correctamente."
            )
            self.write_log(
                "\n" + "=" * 70
                + "\n[ÉXITO] PUNTO DE VENTA DE CELULARES "
                "ACTUALIZADO EN GITHUB\n"
                + "=" * 70
            )

            self.show_info(
                "Proceso terminado",
                "El Punto de Venta de Celulares "
                "se subió correctamente a GitHub.",
            )

        except Exception as exc:
            self.set_status(
                "El proceso terminó con un error."
            )
            self.write_log(
                f"\n[ERROR]\n{exc}"
            )
            self.show_error(
                "No se pudo completar",
                str(exc),
            )

        finally:
            self.set_button_enabled(True)


if __name__ == "__main__":
    try:
        GitHubUploader().mainloop()
    except KeyboardInterrupt:
        sys.exit(130)
