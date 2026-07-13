"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { customerSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";
import { customerWriteRoles } from "@/lib/permissions";

export async function createCustomer(formData: FormData) {
  const user = await requireUser(customerWriteRoles);
  const data = customerSchema.parse(Object.fromEntries(formData));
  const customer = await db.customer.create({ data: { firstName: data.firstName, lastName: data.lastName, phone: data.phone, email: data.email || null, city: data.city || null, privacyAccepted: true, privacyVersion: "2026-01" } });
  await recordAudit({ actorUserId: user.id, action: "CUSTOMER_CREATE", entityType: "Customer", entityId: customer.id });
  revalidatePath("/panel/clientes");
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const user = await requireUser(customerWriteRoles);
  const data = customerSchema.parse(Object.fromEntries(formData));
  await db.customer.update({ where: { id: customerId }, data: { firstName: data.firstName, lastName: data.lastName, phone: data.phone, email: data.email || null, city: data.city || null, privacyAccepted: true } });
  await recordAudit({ actorUserId: user.id, action: "CUSTOMER_UPDATE", entityType: "Customer", entityId: customerId });
  revalidatePath("/panel/clientes");
}

export async function deleteCustomer(customerId: string) {
  const user = await requireUser(customerWriteRoles);
  await db.customer.update({
    where: { id: customerId },
    data: { active: false }
  });
  await recordAudit({ actorUserId: user.id, action: "CUSTOMER_DELETE", entityType: "Customer", entityId: customerId });
  revalidatePath("/panel/clientes");
}
