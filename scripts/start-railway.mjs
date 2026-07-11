import fs from "node:fs";
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

  console.log("Iniciando Next.js...");
  await run("npx", ["--no-install", "next", "start", "-H", "0.0.0.0", "-p", port]);
}

start().catch(console.error);
