import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "@node-rs/argon2";

export async function GET(request: Request) {
  try {
    const passwordHashGeneral = await hash("12345678", {
      algorithm: 2,
      memoryCost: 19456,
      timeCost: 3,
      parallelism: 1,
      outputLen: 32
    });

    const passwordHashAdmin = await hash("Juarez2026", {
      algorithm: 2,
      memoryCost: 19456,
      timeCost: 3,
      parallelism: 1,
      outputLen: 32
    });

    // Clear sessions
    await db.session.deleteMany({});

    let branch = await db.branch.findFirst();
    if (!branch) {
      branch = await db.branch.create({
        data: {
          code: "MATRIZ",
          name: "Sucursal Matriz",
        },
      });
    }

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
          passwordHash: passwordHashGeneral,
          branchId: branch.id
        },
        create: {
          email: item.email,
          name: item.name,
          role: item.role as any,
          active: true,
          passwordHash: passwordHashGeneral,
          branchId: branch.id
        },
        select: {
          email: true,
          name: true,
          role: true
        }
      });
      results.push({ ...user, password: "12345678" });
    }

    // Configure Permanent Admin
    const emailAdmin = "admin@admin.com";
    const userAdmin = await db.user.upsert({
      where: { email: emailAdmin },
      update: {
        name: "Administrador Global",
        role: "ADMIN",
        active: true,
        passwordHash: passwordHashAdmin,
        branchId: branch.id
      },
      create: {
        email: emailAdmin,
        name: "Administrador Global",
        role: "ADMIN",
        active: true,
        passwordHash: passwordHashAdmin,
        branchId: branch.id
      },
      select: {
        email: true,
        name: true,
        role: true
      }
    });
    
    results.push({ ...userAdmin, password: "Juarez2026" });

    return NextResponse.json({
      success: true,
      message: "Todas las cuentas fueron restauradas y el administrador permanente fue configurado exitosamente.",
      users: results
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error resetting passwords", details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
