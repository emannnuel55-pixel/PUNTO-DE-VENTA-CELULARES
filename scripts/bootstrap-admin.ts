import "dotenv/config";

import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import { Role } from "../generated/prisma/enums";

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "Propietario LINOEM";
const branchCode = process.env.BOOTSTRAP_BRANCH_CODE?.trim().toUpperCase() || "MATRIZ";
const branchName = process.env.BOOTSTRAP_BRANCH_NAME?.trim() || "Sucursal Matriz";

if (!databaseUrl) throw new Error("Falta DATABASE_URL.");
if (!email) throw new Error("Falta BOOTSTRAP_ADMIN_EMAIL.");
if (!password || password.length < 12) {
  throw new Error("BOOTSTRAP_ADMIN_PASSWORD debe tener al menos 12 caracteres.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const db = new PrismaClient({ adapter });

try {
  const passwordHash = await hash(password, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  });

  const branch = await db.branch.upsert({
    where: { code: branchCode },
    update: { active: true },
    create: {
      code: branchCode,
      name: branchName,
      active: true,
    },
  });

  const user = await db.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: Role.OWNER,
      active: true,
      branchId: branch.id,
    },
    create: {
      name,
      email,
      passwordHash,
      role: Role.OWNER,
      active: true,
      branchId: branch.id,
    },
  });

  console.log(`Administrador creado o actualizado: ${user.email}`);
  console.log(`Sucursal: ${branch.name} (${branch.code})`);
  console.log("Elimina BOOTSTRAP_ADMIN_PASSWORD de Railway después de ejecutar este comando.");
} finally {
  await db.$disconnect();
}
