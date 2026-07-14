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

    // Clean active sessions for this email to avoid caching anomalies
    const userToClean = await db.user.findUnique({ where: { email: "celularesreparacion957@gmail.com" } });
    if (userToClean) {
      await db.session.deleteMany({ where: { userId: userToClean.id } });
    }

    // Force update the Owner account
    const owner = await db.user.upsert({
      where: { email: "celularesreparacion957@gmail.com" },
      update: {
        name: "Celulares Linoem",
        role: "OWNER",
        active: true,
        passwordHash: passwordHash
      },
      create: {
        email: "celularesreparacion957@gmail.com",
        name: "Celulares Linoem",
        role: "OWNER",
        active: true,
        passwordHash: passwordHash
      }
    });

    // Force update the Admin account
    const admin = await db.user.upsert({
      where: { email: "admin@linoem.mx" },
      update: {
        name: "Administrador Linoem",
        role: "ADMIN",
        active: true,
        passwordHash: passwordHash
      },
      create: {
        email: "admin@linoem.mx",
        name: "Administrador Linoem",
        role: "ADMIN",
        active: true,
        passwordHash: passwordHash
      }
    });

    return NextResponse.json({
      success: true,
      message: "Owner and Admin accounts forced successfully.",
      owner: { email: owner.email, name: owner.name, role: owner.role, password },
      admin: { email: admin.email, name: admin.name, role: admin.role, password }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack });
  }
}

export const dynamic = "force-dynamic";
