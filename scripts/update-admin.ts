import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("Falta DATABASE_URL.");

const adapter = new PrismaPg({ connectionString: databaseUrl });
const db = new PrismaClient({ adapter });

async function createPasswordHash(value: string) {
  return hash(value, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 2,
    hashLength: 32,
  });
}

async function run() {
  const email = "admin@admin.com";
  const password = "Juarez2026";
  const hashedPassword = await createPasswordHash(password);

  console.log(`Upserting user ${email}...`);

  // We need a branch. We'll pick the first branch or create one if none exists.
  let branch = await db.branch.findFirst();
  if (!branch) {
    branch = await db.branch.create({
      data: {
        code: "MATRIZ",
        name: "Sucursal Matriz",
      },
    });
  }

  await db.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email,
      password: hashedPassword,
      name: "Administrador Global",
      role: "ADMIN",
      branchId: branch.id,
    },
  });

  console.log(`User ${email} created/updated with password ${password} successfully.`);
}

run()
  .catch(console.error)
  .finally(() => db.$disconnect());
