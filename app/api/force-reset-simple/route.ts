import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "@node-rs/argon2";

export async function GET(request: Request) {
  try {
    const password = "12345678";
    const passwordHash = await hash(password, {
      algorithm: 2,
      memoryCost: 19456,
      timeCost: 3,
      parallelism: 1,
      outputLen: 32
    });

    // Clean active sessions for all users to prevent caching anomalies
    await db.session.deleteMany({});

    const emailsToReset = [
      { email: "celularesreparacion957@gmail.com", name: "Celulares Linoem", role: "OWNER" },
      { email: "admin@linoem.mx", name: "Administrador Linoem", role: "ADMIN" },
      { email: "propietario@linoem.mx", name: "Propietario Linoem", role: "OWNER" },
      { email: "gerente@linoem.mx", name: "Gerente Linoem", role: "MANAGER" },
      { email: "recepcion@linoem.mx", name: "Recepcionista Linoem", role: "RECEPTION" },
      { email: "tecnico@linoem.mx", name: "Técnico Linoem", role: "TECHNICIAN" },
      { email: "ventas@linoem.mx", name: "Vendedor Linoem", role: "SALES" },
      { email: "almacen@linoem.mx", name: "Almacenista Linoem", role: "WAREHOUSE" },
      { email: "finanzas@linoem.mx", name: "Finanzas Linoem", role: "FINANCE" },
      { email: "auditor@linoem.mx", name: "Auditor Linoem", role: "AUDITOR" }
    ];

    const results = [];
    for (const item of emailsToReset) {
      const user = await db.user.upsert({
        where: { email: item.email },
        update: {
          name: item.name,
          role: item.role as any,
          active: true,
          passwordHash: passwordHash
        },
        create: {
          email: item.email,
          name: item.name,
          role: item.role as any,
          active: true,
          passwordHash: passwordHash
        },
        select: {
          email: true,
          name: true,
          role: true
        }
      });
      results.push({ ...user, password });
    }

    return NextResponse.json({
      success: true,
      message: "All database users have been reset to the simple numeric password.",
      updatedUsers: results
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack });
  }
}

export const dynamic = "force-dynamic";
