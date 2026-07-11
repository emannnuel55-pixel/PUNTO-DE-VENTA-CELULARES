"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SignJWT } from "jose";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createAccessCredential } from "@/lib/access-code";
import { repairSchema } from "@/lib/validation";
import { createFolio } from "@/lib/folio";
import { recordAudit } from "@/lib/audit";
import { requiredEnv } from "@/lib/env";
import { RepairStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { repairWriteRoles } from "@/lib/permissions";

export async function createRepair(formData: FormData) {
  const user = await requireUser(repairWriteRoles);
  if (!user.branchId) throw new Error("El usuario no tiene sucursal.");
  const data = repairSchema.parse(Object.fromEntries(formData));
  const credential = await createAccessCredential();
  const order = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const device = await tx.device.create({ data: { customerId: data.customerId, brand: data.brand, model: data.model, color: data.color || null, serialNumber: data.serialNumber || null, imei: data.imei || null } });
    return tx.repairOrder.create({
      data: {
        publicFolio: createFolio("PVC"), branchId: user.branchId!, customerId: data.customerId, deviceId: device.id,
        receivedById: user.id, technicianId: data.technicianId || null, issue: data.issue, physicalCondition: data.physicalCondition || null,
        accessories: data.accessories || null, initialEstimate: data.initialEstimate, deposit: data.deposit, total: data.initialEstimate,
        promisedAt: data.promisedAt ? new Date(data.promisedAt) : null, accessCodeHash: credential.hash, accessCodeLookup: credential.lookup, accessCodeLast4: credential.last4,
        updates: { create: { userId: user.id, newStatus: RepairStatus.RECEIVED, sequence: 1, comment: "Equipo recibido y orden creada." } }
      }
    });
  });
  await recordAudit({ actorUserId: user.id, action: "REPAIR_CREATE", entityType: "RepairOrder", entityId: order.id, metadata: { folio: order.publicFolio } });
  const secret = new TextEncoder().encode(requiredEnv("SESSION_SECRET"));
  const token = await new SignJWT({ repairOrderId: order.id, code: credential.code }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("5m").sign(secret);
  const cookieStore = await cookies();
  cookieStore.set("pvc_issued_code", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 300, path: "/panel/reparaciones" });
  redirect(`/panel/reparaciones/${order.id}`);
}

export async function revokeClientAccess(orderId: string) {
  const user = await requireUser(repairWriteRoles);
  await db.$transaction([db.repairOrder.update({ where: { id: orderId }, data: { accessCodeRevokedAt: new Date() } }), db.clientSession.deleteMany({ where: { repairOrderId: orderId } })]);
  await recordAudit({ actorUserId: user.id, action: "CLIENT_ACCESS_REVOKE", entityType: "RepairOrder", entityId: orderId });
  revalidatePath(`/panel/reparaciones/${orderId}`);
}

export async function regenerateClientAccess(orderId: string) {
  const user = await requireUser(repairWriteRoles);
  const credential = await createAccessCredential();
  await db.$transaction([db.repairOrder.update({ where: { id: orderId }, data: { accessCodeHash: credential.hash, accessCodeLookup: credential.lookup, accessCodeLast4: credential.last4, accessCodeRevokedAt: null } }), db.clientSession.deleteMany({ where: { repairOrderId: orderId } })]);
  await recordAudit({ actorUserId: user.id, action: "CLIENT_ACCESS_REGENERATE", entityType: "RepairOrder", entityId: orderId });
  const secret = new TextEncoder().encode(requiredEnv("SESSION_SECRET"));
  const token = await new SignJWT({ repairOrderId: orderId, code: credential.code }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("5m").sign(secret);
  const cookieStore = await cookies();
  cookieStore.set("pvc_issued_code", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 300, path: "/panel/reparaciones" });
  revalidatePath(`/panel/reparaciones/${orderId}`);
}
