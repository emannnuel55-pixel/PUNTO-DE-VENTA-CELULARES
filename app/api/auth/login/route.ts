import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/security";
import { createEmployeeSession } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const data = loginSchema.parse(Object.fromEntries(form));
    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user || !user.active || !(await verifyPassword(user.passwordHash, data.password))) {
      await recordAudit({ action: "LOGIN_FAILED", entityType: "User", result: "DENIED", metadata: { email: data.email } });
      return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
    }
    await createEmployeeSession(user.id);
    await recordAudit({ actorUserId: user.id, action: "LOGIN_SUCCESS", entityType: "User", entityId: user.id });
    return NextResponse.redirect(new URL("/panel", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }
}
