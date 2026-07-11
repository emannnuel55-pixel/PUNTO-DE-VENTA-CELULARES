import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

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

// Función auxiliar para copiar directorios de manera recursiva
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function start() {
  const port = process.env.PORT || "8080";

  if (!process.env.DATABASE_URL) {
    console.error("⚠️ DATABASE_URL no está configurada en Railway. El portal de login mostrará un error.");
  } else {
    try {
      console.log("Sincronizando base de datos...");
      await run("npx", ["--no-install", "prisma", "db", "push", "--accept-data-loss"]);

      if (process.env.BOOTSTRAP_ADMIN_EMAIL && process.env.BOOTSTRAP_ADMIN_PASSWORD) {
        console.log("Ejecutando creación o actualización segura de usuarios iniciales...");
        await run("npm", ["run", "admin:bootstrap"]);
      } else if (process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.BOOTSTRAP_ADMIN_PASSWORD) {
        console.warn("⚠️ Bootstrap omitido: BOOTSTRAP_ADMIN_EMAIL y BOOTSTRAP_ADMIN_PASSWORD deben configurarse juntos.");
      }
    } catch (error) {
      console.error("⚠️ Error durante la inicialización de la base de datos (se ignorará para permitir que la app arranque):", error);
    }
  }

  // Si existe el modo standalone (compilación optimizada para producción/Docker/Railway)
  if (fs.existsSync(".next/standalone/server.js")) {
    console.log("Preparando recursos estáticos para modo standalone...");
    try {
      if (fs.existsSync("public")) {
        copyDirSync("public", ".next/standalone/public");
      }
      if (fs.existsSync(".next/static")) {
        copyDirSync(".next/static", ".next/standalone/.next/static");
      }
      console.log("Recursos estáticos copiados correctamente.");
    } catch (err) {
      console.warn("⚠️ Advertencia al copiar recursos estáticos:", err.message);
    }

    console.log("Iniciando Next.js en modo Standalone (Seguro)...");
    process.env.HOSTNAME = "0.0.0.0";
    process.env.PORT = port;
    await run("node", [".next/standalone/server.js"]);
  } else {
    // Modo de respaldo tradicional
    console.log("Iniciando Next.js en modo tradicional...");
    await run("npx", ["--no-install", "next", "start", "-H", "0.0.0.0", "-p", port]);
  }
}

start().catch(console.error);
