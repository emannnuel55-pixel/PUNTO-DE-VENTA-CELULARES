import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/security";
import { createEmployeeSession } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

const adminRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER];

function redirectToLogin(request: Request, error: "credentials" | "setup" | "server") {
  return NextResponse.redirect(new URL(`/login?error=${error}`, request.url), 303);
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const data = loginSchema.parse(Object.fromEntries(form));
    const user = await db.user.findUnique({ where: { email: data.email } });

    if (!user) {
      const usersRegistered = await db.user.count();
      if (usersRegistered === 0) return redirectToLogin(request, "setup");

      await recordAudit({
        action: "LOGIN_FAILED",
        entityType: "User",
        result: "DENIED",
        metadata: { email: data.email, reason: "USER_NOT_FOUND" },
      });
      return redirectToLogin(request, "credentials");
    }

    const validPassword = user.active && (await verifyPassword(user.passwordHash, data.password));
    if (!validPassword) {
      await recordAudit({
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: user.id,
        result: "DENIED",
        metadata: { email: data.email, reason: user.active ? "INVALID_PASSWORD" : "INACTIVE_USER" },
      });
      return redirectToLogin(request, "credentials");
    }

    await createEmployeeSession(user.id);
    await recordAudit({
      actorUserId: user.id,
      action: "LOGIN_SUCCESS",
      entityType: "User",
      entityId: user.id,
    });

    const target = adminRoles.includes(user.role) ? "/panel/administrador" : "/panel/trabajador";
    return NextResponse.redirect(new URL(target, request.url), 303);
  } catch (error) {
    console.error("Employee login error:", error);
    return redirectToLogin(request, "server");
  }
}
