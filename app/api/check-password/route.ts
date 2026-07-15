import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const user = await db.user.findUnique({ where: { email: "celularesreparacion957@gmail.com" } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" });
    }

    const matchesOriginal = await verifyPassword(user.passwordHash, "12345678");
    const matchesLinoem = await verifyPassword(user.passwordHash, "Linoem2026!");
    const matchesDemo = await verifyPassword(user.passwordHash, "LinoemDemo2026!");

    // Let's also force update it to "12345678" to make absolutely sure it is set
    const forcedHash = await hashPassword("12345678");
    await db.user.update({
      where: { email: "celularesreparacion957@gmail.com" },
      data: {
        passwordHash: forcedHash,
        active: true
      }
    });

    const verifyAfterForcing = await verifyPassword(forcedHash, "12345678");

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        active: user.active
      },
      checks: {
        matches_12345678: matchesOriginal,
        matches_Linoem2026: matchesLinoem,
        matches_LinoemDemo2026: matchesDemo
      },
      forcing: {
        forced_to_12345678: true,
        verified_after_forcing: verifyAfterForcing
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack });
  }
}

export const dynamic = "force-dynamic";
