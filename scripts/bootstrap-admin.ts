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
const createStaff = process.env.BOOTSTRAP_CREATE_STAFF?.trim().toLowerCase() === "true";

if (!databaseUrl) throw new Error("Falta DATABASE_URL.");
if (!email) throw new Error("Falta BOOTSTRAP_ADMIN_EMAIL.");
if (!password || password.length < 12) {
  throw new Error("BOOTSTRAP_ADMIN_PASSWORD debe tener al menos 12 caracteres.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const db = new PrismaClient({ adapter });

async function createPasswordHash(value: string) {
  return hash(value, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  });
}

try {
  const passwordHash = await createPasswordHash(password);

  const branch = await db.branch.upsert({
    where: { code: branchCode },
    update: { name: branchName, active: true },
    create: {
      code: branchCode,
      name: branchName,
      active: true,
    },
  });

  const owner = await db.user.upsert({
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

  console.log(`Administrador creado o actualizado: ${owner.email}`);

  if (createStaff) {
    const staff = [
      {
        name: "Técnico Principal",
        email: "tecnico@linoem.mx",
        role: Role.TECHNICIAN,
      },
      {
        name: "Ventas Mostrador",
        email: "ventas@linoem.mx",
        role: Role.SALES,
      },
    ];

    for (const account of staff) {
      const user = await db.user.upsert({
        where: { email: account.email },
        update: {
          name: account.name,
          passwordHash,
          role: account.role,
          active: true,
          branchId: branch.id,
        },
        create: {
          name: account.name,
          email: account.email,
          passwordHash,
          role: account.role,
          active: true,
          branchId: branch.id,
        },
      });
      console.log(`Usuario de personal creado o actualizado: ${user.email}`);
    }
  }

  console.log(`Sucursal: ${branch.name} (${branch.code})`);
  console.log("Por seguridad, elimina BOOTSTRAP_ADMIN_PASSWORD y BOOTSTRAP_CREATE_STAFF después del despliegue correcto.");
} finally {
  await db.$disconnect();
}
