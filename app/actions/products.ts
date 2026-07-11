"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { productSchema } from "@/lib/validation";
import { inventoryRoles } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";
import { InventoryMovementType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export async function createProduct(formData: FormData) {
  const user = await requireUser(inventoryRoles);
  if (!user.branchId) throw new Error("El usuario no tiene sucursal.");
  const data = productSchema.parse(Object.fromEntries(formData));
  const product = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.product.create({ data: { branchId: user.branchId!, sku: data.sku, name: data.name, category: data.category, brand: data.brand || null, cost: data.cost, price: data.price, stock: data.stock, minimumStock: data.minimumStock } });
    await tx.inventoryMovement.create({ data: { productId: created.id, type: InventoryMovementType.INITIAL, quantity: data.stock, previousStock: 0, newStock: data.stock, reference: "ALTA-INICIAL" } });
    return created;
  });
  await recordAudit({ actorUserId: user.id, action: "PRODUCT_CREATE", entityType: "Product", entityId: product.id });
  revalidatePath("/panel/productos");
}

export async function adjustStock(productId: string, formData: FormData) {
  const user = await requireUser(inventoryRoles);
  const quantity = Number(formData.get("quantity"));
  const notes = String(formData.get("notes") || "Ajuste manual").slice(0,500);
  if (!Number.isInteger(quantity) || quantity === 0) throw new Error("Cantidad inválida.");
  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });
    const newStock = product.stock + quantity;
    if (newStock < 0) throw new Error("El inventario no puede quedar negativo.");
    const updated = await tx.product.update({ where: { id: productId }, data: { stock: newStock } });
    await tx.inventoryMovement.create({ data: { productId, type: InventoryMovementType.ADJUSTMENT, quantity, previousStock: product.stock, newStock, notes } });
    return updated;
  });
  await recordAudit({ actorUserId: user.id, action: "STOCK_ADJUST", entityType: "Product", entityId: productId, metadata: { quantity, newStock: result.stock } });
  revalidatePath("/panel/productos");
}
