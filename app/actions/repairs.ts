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
  
  const parsedPhotos: string[] = [];
  if (data.photosJson) {
    try {
      const urls = JSON.parse(data.photosJson);
      if (Array.isArray(urls)) {
        parsedPhotos.push(...urls.filter((u) => typeof u === "string"));
      }
    } catch (e) {
      console.error("Error parsing photosJson:", e);
    }
  }

  const order = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const device = await tx.device.create({ data: { customerId: data.customerId, brand: data.brand, model: data.model, color: data.color || null, serialNumber: data.serialNumber || null, imei: data.imei || null } });
    return tx.repairOrder.create({
      data: {
        publicFolio: createFolio("PVC"), branchId: user.branchId!, customerId: data.customerId, deviceId: device.id,
        receivedById: user.id, technicianId: data.technicianId || null, issue: data.issue, physicalCondition: data.physicalCondition || null,
        accessories: data.accessories || null, initialEstimate: data.initialEstimate, deposit: data.deposit, total: data.initialEstimate,
        promisedAt: data.promisedAt ? new Date(data.promisedAt) : null, accessCodeHash: credential.hash, accessCodeLookup: credential.lookup, accessCodeLast4: credential.last4,
        accessCodePlain: credential.code,
        updates: { create: { userId: user.id, newStatus: RepairStatus.RECEIVED, sequence: 1, comment: "Equipo recibido y orden creada." } },
        photos: {
          create: parsedPhotos.map((url) => ({ url }))
        }
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
  await db.$transaction([db.repairOrder.update({ where: { id: orderId }, data: { accessCodeHash: credential.hash, accessCodeLookup: credential.lookup, accessCodeLast4: credential.last4, accessCodePlain: credential.code, accessCodeRevokedAt: null } }), db.clientSession.deleteMany({ where: { repairOrderId: orderId } })]);
  await recordAudit({ actorUserId: user.id, action: "CLIENT_ACCESS_REGENERATE", entityType: "RepairOrder", entityId: orderId });
  const secret = new TextEncoder().encode(requiredEnv("SESSION_SECRET"));
  const token = await new SignJWT({ repairOrderId: orderId, code: credential.code }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("5m").sign(secret);
  const cookieStore = await cookies();
  cookieStore.set("pvc_issued_code", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 300, path: "/panel/reparaciones" });
  revalidatePath(`/panel/reparaciones/${orderId}`);
}

export async function updateRepair(orderId: string, formData: FormData) {
  const user = await requireUser(repairWriteRoles);
  
  const issue = String(formData.get("issue") || "").trim();
  const physicalCondition = String(formData.get("physicalCondition") || "").trim();
  const accessories = String(formData.get("accessories") || "").trim();
  const diagnosis = String(formData.get("diagnosis") || "").trim();
  
  const initialEstimate = Number(formData.get("initialEstimate") || 0);
  const deposit = Number(formData.get("deposit") || 0);
  const promisedAtStr = String(formData.get("promisedAt") || "");
  const promisedAt = promisedAtStr ? new Date(promisedAtStr) : null;
  
  const brand = String(formData.get("brand") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const color = String(formData.get("color") || "").trim();
  const serialNumber = String(formData.get("serialNumber") || "").trim();
  const imei = String(formData.get("imei") || "").trim();

  if (!issue) throw new Error("La descripción del problema es requerida.");
  if (!brand || !model) throw new Error("Marca y modelo del dispositivo son requeridos.");

  const order = await db.repairOrder.findUniqueOrThrow({ where: { id: orderId } });

  await db.$transaction(async (tx) => {
    await tx.repairOrder.update({
      where: { id: orderId },
      data: {
        issue,
        physicalCondition: physicalCondition || null,
        accessories: accessories || null,
        diagnosis: diagnosis || null,
        initialEstimate,
        deposit,
        promisedAt
      }
    });

    await tx.device.update({
      where: { id: order.deviceId },
      data: {
        brand,
        model,
        color: color || null,
        serialNumber: serialNumber || null,
        imei: imei || null
      }
    });
  });

  await recordAudit({ actorUserId: user.id, action: "REPAIR_UPDATE", entityType: "RepairOrder", entityId: orderId });
  revalidatePath(`/panel/reparaciones/${orderId}`);
  revalidatePath("/panel/reparaciones");
}

export async function deleteRepair(orderId: string) {
  const user = await requireUser(repairWriteRoles);
  
  await db.repairOrder.delete({
    where: { id: orderId }
  });
  
  await recordAudit({ actorUserId: user.id, action: "REPAIR_DELETE", entityType: "RepairOrder", entityId: orderId });
  revalidatePath("/panel/reparaciones");
}
