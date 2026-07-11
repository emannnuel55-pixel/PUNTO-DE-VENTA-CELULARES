import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/security";
import type { Role } from "@/generated/prisma/enums";

const COOKIE = "pvc_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

export async function createEmployeeSession(userId: string) {
  const raw = randomToken();
  const headerStore = await headers();
  await db.session.create({
    data: {
      tokenHash: sha256(raw),
      userId,
      expiresAt: new Date(Date.now() + MAX_AGE_SECONDS * 1000),
      ipAddress: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: headerStore.get("user-agent")?.slice(0, 500)
    }
  });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: sha256(raw) },
    include: { user: { include: { branch: true } } }
  });
  if (!session || session.expiresAt <= new Date() || !session.user.active) return null;
  return session.user;
}

export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/panel?error=sin-permiso");
  return user;
}

export async function destroyEmployeeSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;
  if (raw) await db.session.deleteMany({ where: { tokenHash: sha256(raw) } });
  cookieStore.delete(COOKIE);
}
