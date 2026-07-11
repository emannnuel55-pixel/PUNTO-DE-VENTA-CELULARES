import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/security";

const COOKIE = "pvc_client";
const MAX_AGE_SECONDS = 60 * 60 * 4;

export async function createClientSession(repairOrderId: string) {
  const raw = randomToken();
  await db.clientSession.create({
    data: {
      tokenHash: sha256(raw),
      repairOrderId,
      expiresAt: new Date(Date.now() + MAX_AGE_SECONDS * 1000),
    },
  });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getClientOrder() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return null;

  const session = await db.clientSession.findUnique({
    where: { tokenHash: sha256(raw) },
    include: {
      repairOrder: {
        include: {
          customer: true,
          device: true,
          branch: true,
          technician: { select: { name: true } },
          updates: { where: { visibleToCustomer: true }, orderBy: { sequence: "asc" } },
          messages: {
            where: { visibleToCustomer: true },
            orderBy: { createdAt: "asc" },
            include: { senderUser: { select: { name: true } } },
          },
          estimates: { orderBy: { version: "desc" } },
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) return null;
  if (session.repairOrder.accessCodeRevokedAt && session.repairOrder.status !== "DELIVERED") return null;
  return session.repairOrder;
}

export async function requireClientOrder() {
  const order = await getClientOrder();
  if (!order) redirect("/seguimiento?error=sesion");
  return order;
}

export async function destroyClientSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;
  if (raw) await db.clientSession.deleteMany({ where: { tokenHash: sha256(raw) } });
  cookieStore.delete(COOKIE);
}
