import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "@node-rs/argon2";

export async function GET(request: Request) {
  try {
    const password = "Juarez2026";
    const passwordHash = await hash(password, {
      algorithm: 2,
      memoryCost: 19456,
      timeCost: 3,
      parallelism: 1,
      outputLen: 32
    });

    let branch = await db.branch.findFirst();
    if (!branch) {
      branch = await db.branch.create({
        data: {
          code: "MATRIZ",
          name: "Sucursal Matriz",
        },
      });
    }

    const email = "admin@admin.com";
    const user = await db.user.upsert({
      where: { email },
      update: {
        name: "Administrador Global",
        role: "ADMIN",
        active: true,
        passwordHash: passwordHash,
        branchId: branch.id
      },
      create: {
        email: email,
        name: "Administrador Global",
        role: "ADMIN",
        active: true,
        passwordHash: passwordHash,
        branchId: branch.id
      }
    });

    return NextResponse.json({
      message: "Contraseña restablecida con éxito para admin@admin.com",
      user: {
        email: user.email,
        role: user.role,
        id: user.id
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error resetting password", details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
