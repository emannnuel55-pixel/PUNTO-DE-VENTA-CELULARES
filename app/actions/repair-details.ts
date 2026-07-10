"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireClientOrder } from "@/lib/customer-auth";
import { canTransition } from "@/lib/repair-state";
import { recordAudit } from "@/lib/audit";
import { EstimateStatus, MessageSenderType, RepairStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { repairWriteRoles } from "@/lib/permissions";

export async function addRepairUpdate(orderId: string, formData: FormData) {
  const user = await requireUser(repairWriteRoles);
  const newStatus = String(formData.get("status")) as RepairStatus;
  const comment = String(formData.get("comment") || "").trim();
  const diagnosis = String(formData.get("diagnosis") || "").trim();
  if (comment.length < 3) throw new Error("Agrega un comentario.");
  const order = await db.repairOrder.findUniqueOrThrow({ where: { id: orderId }, include: { _count: { select: { updates: true } } } });
  const pendingEstimate = await db.estimate.count({ where: { repairOrderId: orderId, status: EstimateStatus.PENDING } });
  if (pendingEstimate > 0 && [RepairStatus.REPAIRING, RepairStatus.TESTING, RepairStatus.COMPLETED].includes(newStatus)) throw new Error("Existe una cotización adicional pendiente de autorización del cliente.");
  if (!canTransition(order.status, newStatus)) throw new Error(`Transición no permitida: ${order.status} → ${newStatus}`);
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.repairOrder.update({ where: { id: orderId }, data: { status: newStatus, diagnosis: diagnosis || order.diagnosis, deliveredAt: newStatus === RepairStatus.DELIVERED ? new Date() : order.deliveredAt, accessCodeRevokedAt: newStatus === RepairStatus.DELIVERED ? new Date() : order.accessCodeRevokedAt } });
    await tx.repairUpdate.create({ data: { repairOrderId: orderId, userId: user.id, previousStatus: order.status, newStatus, comment, sequence: order._count.updates + 1 } });
    if (newStatus === RepairStatus.DELIVERED) await tx.clientSession.deleteMany({ where: { repairOrderId: orderId } });
  });
  await recordAudit({ actorUserId: user.id, action: "REPAIR_STATUS_CHANGE", entityType: "RepairOrder", entityId: orderId, metadata: { from: order.status, to: newStatus } });
  revalidatePath(`/panel/reparaciones/${orderId}`); revalidatePath("/cliente");
}

export async function createEstimate(orderId: string, formData: FormData) {
  const user = await requireUser(repairWriteRoles);
  const title = String(formData.get("title") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  const parts = Number(formData.get("partsAmount") || 0);
  const labor = Number(formData.get("laborAmount") || 0);
  const tax = Number(formData.get("taxAmount") || 0);
  if (title.length < 3 || reason.length < 5 || [parts,labor,tax].some((n) => !Number.isFinite(n) || n < 0)) throw new Error("Cotización inválida.");
  const last = await db.estimate.findFirst({ where: { repairOrderId: orderId }, orderBy: { version: "desc" } });
  const estimate = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    if (last?.status === EstimateStatus.PENDING) await tx.estimate.update({ where: { id: last.id }, data: { status: EstimateStatus.SUPERSEDED } });
    const created = await tx.estimate.create({ data: { repairOrderId: orderId, version: (last?.version || 0) + 1, title, reason, partsAmount: parts, laborAmount: labor, taxAmount: tax, totalAmount: parts + labor + tax } });
    await tx.message.create({ data: { repairOrderId: orderId, senderType: MessageSenderType.SYSTEM, body: `Se envió la cotización adicional v${created.version}: ${title}.` } });
    return created;
  });
  await recordAudit({ actorUserId: user.id, action: "ESTIMATE_CREATE", entityType: "Estimate", entityId: estimate.id, metadata: { orderId, total: parts + labor + tax } });
  revalidatePath(`/panel/reparaciones/${orderId}`); revalidatePath("/cliente");
}

export async function sendStaffMessage(orderId: string, formData: FormData) {
  const user = await requireUser(repairWriteRoles);
  const body = String(formData.get("body") || "").trim();
  if (body.length < 1 || body.length > 3000) throw new Error("Mensaje inválido.");
  await db.message.create({ data: { repairOrderId: orderId, senderType: MessageSenderType.EMPLOYEE, senderUserId: user.id, body } });
  revalidatePath(`/panel/reparaciones/${orderId}`); revalidatePath("/cliente");
}

export async function sendCustomerMessage(formData: FormData) {
  const order = await requireClientOrder();
  const body = String(formData.get("body") || "").trim();
  if (body.length < 1 || body.length > 3000) throw new Error("Mensaje inválido.");
  await db.message.create({ data: { repairOrderId: order.id, senderType: MessageSenderType.CUSTOMER, body } });
  revalidatePath("/cliente"); revalidatePath(`/panel/reparaciones/${order.id}`);
}

export async function decideEstimate(estimateId: string, decision: "ACCEPTED" | "REJECTED") {
  const order = await requireClientOrder();
  const estimate = await db.estimate.findFirst({ where: { id: estimateId, repairOrderId: order.id, status: EstimateStatus.PENDING } });
  if (!estimate) throw new Error("Cotización no disponible.");
  const headerStore = await headers();
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.estimate.update({ where: { id: estimateId }, data: { status: decision, customerDecisionAt: new Date(), customerDecisionIp: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() } });
    await tx.message.create({ data: { repairOrderId: order.id, senderType: MessageSenderType.SYSTEM, body: decision === "ACCEPTED" ? `El cliente aceptó la cotización adicional v${estimate.version}.` : `El cliente rechazó la cotización adicional v${estimate.version}.` } });
    await tx.repairOrder.update({ where: { id: order.id }, data: { status: decision === "ACCEPTED" ? RepairStatus.AUTHORIZED : RepairStatus.NOT_AUTHORIZED, total: decision === "ACCEPTED" ? Number(order.total) + Number(estimate.totalAmount) : order.total } });
  });
  await recordAudit({ action: "CUSTOMER_ESTIMATE_DECISION", entityType: "Estimate", entityId: estimateId, metadata: { orderId: order.id, decision } });
  revalidatePath("/cliente"); revalidatePath(`/panel/reparaciones/${order.id}`);
}
