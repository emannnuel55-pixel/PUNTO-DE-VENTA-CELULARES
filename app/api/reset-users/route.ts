import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "@node-rs/argon2";

export async function GET(request: Request) {
  try {
    const password = "Linoem2026!";
    const passwordHash = await hash(password, {
      algorithm: 2,
      memoryCost: 19456,
      timeCost: 3,
      parallelism: 1,
      outputLen: 32
    });

    const updates = [
      { email: "celularesreparacion957@gmail.com", name: "Celulares Linoem" },
      { email: "propietario@linoem.mx", name: "Propietario Linoem" },
      { email: "admin@linoem.mx", name: "Administrador Linoem" },
      { email: "gerente@linoem.mx", name: "Gerente Linoem" },
      { email: "recepcion@linoem.mx", name: "Recepcionista Linoem" },
      { email: "tecnico@linoem.mx", name: "Técnico Linoem" },
      { email: "ventas@linoem.mx", name: "Vendedor Linoem" },
      { email: "almacen@linoem.mx", name: "Almacenista Linoem" },
      { email: "finanzas@linoem.mx", name: "Finanzas Linoem" },
      { email: "auditor@linoem.mx", name: "Auditor Linoem" }
    ];

    const results = [];
    for (const update of updates) {
      const user = await db.user.findUnique({ where: { email: update.email } });
      if (user) {
        const updated = await db.user.update({
          where: { email: update.email },
          data: {
            name: update.name,
            passwordHash: passwordHash,
            active: true
          },
          select: {
            email: true,
            name: true,
            role: true
          }
        });
        results.push({ ...updated, password });
      }
    }

    return NextResponse.json({ success: true, updatedUsers: results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack });
  }
}

export const dynamic = "force-dynamic";
