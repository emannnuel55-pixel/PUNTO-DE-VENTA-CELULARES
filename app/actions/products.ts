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
  const descriptionJson = JSON.stringify({
    description: data.desc || "",
    ram: data.ram || "",
    rom: data.rom || "",
    cpu: data.cpu || "",
    os: data.os || "",
    cameras: data.cameras || ""
  });

  const product = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.product.create({ 
      data: { 
        branchId: user.branchId!, 
        sku: data.sku, 
        name: data.name, 
        category: data.category, 
        brand: data.brand || null, 
        cost: data.cost, 
        price: data.price, 
        stock: data.stock, 
        minimumStock: data.minimumStock, 
        imageUrl: data.imageUrl || null,
        description: descriptionJson
      } 
    });
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

export async function updateProduct(productId: string, formData: FormData) {
  const user = await requireUser(inventoryRoles);
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const brand = String(formData.get("brand") || "").trim();
  const cost = Number(formData.get("cost") || 0);
  const price = Number(formData.get("price") || 0);
  const minimumStock = Number(formData.get("minimumStock") || 0);
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  
  // Ficha técnica
  const desc = String(formData.get("desc") || "").trim();
  const ram = String(formData.get("ram") || "").trim();
  const rom = String(formData.get("rom") || "").trim();
  const cpu = String(formData.get("cpu") || "").trim();
  const os = String(formData.get("os") || "").trim();
  const cameras = String(formData.get("cameras") || "").trim();

  if (!name || !category || cost < 0 || price < 0 || minimumStock < 0) {
    throw new Error("Datos del producto inválidos.");
  }

  const descriptionJson = JSON.stringify({
    description: desc,
    ram,
    rom,
    cpu,
    os,
    cameras
  });
  
  await db.product.update({
    where: { id: productId },
    data: {
      name,
      category,
      brand: brand || null,
      cost,
      price,
      minimumStock,
      imageUrl: imageUrl || null,
      description: descriptionJson
    }
  });
  
  await recordAudit({ actorUserId: user.id, action: "PRODUCT_UPDATE", entityType: "Product", entityId: productId });
  revalidatePath("/panel/productos");
}

export async function deleteProduct(productId: string) {
  const user = await requireUser(inventoryRoles);
  
  await db.product.update({
    where: { id: productId },
    data: { active: false }
  });
  
  await recordAudit({ actorUserId: user.id, action: "PRODUCT_DELETE", entityType: "Product", entityId: productId });
  revalidatePath("/panel/productos");
}
