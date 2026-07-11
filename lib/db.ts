import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { requiredEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = requiredEnv("DATABASE_URL");
    const createProxy = (errorMessage: string) => new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === "then" || prop === "$connect" || prop === "$disconnect") return undefined;
        throw new Error(errorMessage);
      }
    });

  if (connectionString.startsWith("__PLACEHOLDER_")) {
    return createProxy(`Base de datos no disponible (build-time placeholder). Configura DATABASE_URL.`);
  }

  try {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
  } catch (error: any) {
    console.error("FATAL: DATABASE_URL inválida detectada al iniciar. El servidor arrancará pero fallará al consultar DB.", error.message);
    return createProxy(`DATABASE_URL configurada en Railway es inválida o tiene formato incorrecto: ${error.message}`);
  }
}

export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
