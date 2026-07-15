import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createEmployeeSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await db.user.findUnique({
      where: { email: "celularesreparacion957@gmail.com" }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Force active state just in case
    if (!user.active) {
      await db.user.update({
        where: { id: user.id },
        data: { active: true }
      });
    }

    // Create session
    await createEmployeeSession(user.id);

    // Redirect to admin panel
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:8080";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(new URL("/panel/administrador", `${proto}://${host}`), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
