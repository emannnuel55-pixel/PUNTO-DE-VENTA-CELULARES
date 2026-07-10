import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} terminó con código ${code}`)));
  });
}

const port = process.env.PORT || "3000";
await run("npx", ["prisma", "migrate", "deploy"]);
await run("npx", ["next", "start", "-p", port]);
