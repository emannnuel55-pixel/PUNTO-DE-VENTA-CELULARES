import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClientSession } from "@/lib/customer-auth";
import { hmacAccessCode, normalizeAccessCode, sha256, verifyPassword } from "@/lib/security";
import { isAccessCodeShape } from "@/lib/access-code";
import { recordAudit } from "@/lib/audit";
import { RepairStatus } from "@/generated/prisma/enums";

function getAbsoluteUrl(targetPath: string, request: Request): URL {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:8080";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return new URL(targetPath, `${proto}://${host}`);
}

export async function POST(request: Request) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const form = await request.formData();
  const code = String(form.get("code") || "");
  const normalized = normalizeAccessCode(code);
  const lookup = hmacAccessCode(normalized || "INVALID");
  const attemptKey = sha256(`${ip}:${lookup}`);

  try {
    const previous = await db.accessAttempt.findUnique({ where: { key: attemptKey } });
    if (previous?.blockedUntil && previous.blockedUntil > new Date()) throw new Error("blocked");
    if (!isAccessCodeShape(code)) throw new Error("invalid");

    const order = await db.repairOrder.findUnique({ where: { accessCodeLookup: lookup } });
    const mayViewReceipt = order?.status === RepairStatus.DELIVERED;
    if (!order || (order.accessCodeRevokedAt && !mayViewReceipt) || !(await verifyPassword(order.accessCodeHash, normalized))) throw new Error("invalid");

    await db.accessAttempt.deleteMany({ where: { key: attemptKey } });
    await createClientSession(order.id);
    await recordAudit({ action: "CLIENT_ACCESS_SUCCESS", entityType: "RepairOrder", entityId: order.id });
    return NextResponse.redirect(getAbsoluteUrl("/cliente", request), 303);
  } catch {
    const existing = await db.accessAttempt.findUnique({ where: { key: attemptKey } });
    const attempts = (existing?.attempts || 0) + 1;
    const blockedUntil = attempts >= 5 ? new Date(Date.now() + Math.min(60, attempts * 3) * 60_000) : null;
    await db.accessAttempt.upsert({
      where: { key: attemptKey },
      update: { attempts, blockedUntil },
      create: { key: attemptKey, attempts, blockedUntil }
    });
    await recordAudit({ action: "CLIENT_ACCESS_FAILED", entityType: "RepairOrder", result: "DENIED", metadata: { attempts } });
    return NextResponse.redirect(getAbsoluteUrl("/seguimiento?error=1", request), 303);
  }
}
