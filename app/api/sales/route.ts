import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { salesRoles } from "@/lib/permissions";
import { calculateSale } from "@/lib/money";
import { createFolio } from "@/lib/folio";
import { recordAudit } from "@/lib/audit";
import { InventoryMovementType, PaymentMethod } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

const schema = z.object({
  idempotencyKey: z.string().uuid(),
  paymentMethod: z.enum(PaymentMethod),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(1000) })).min(1).max(100)
});

export async function POST(request: Request) {
  try {
    const user = await requireUser(salesRoles);
    if (!user.branchId) return NextResponse.json({ error: "Usuario sin sucursal." }, { status: 400 });
    const input = schema.parse(await request.json());

    const existing = await db.sale.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return NextResponse.json({ folio: existing.folio, total: Number(existing.total), repeated: true });

    const ids = [...new Set(input.items.map((item) => item.productId))];
    const products = await db.product.findMany({ where: { id: { in: ids }, active: true, branchId: user.branchId } });
    if (products.length !== ids.length) return NextResponse.json({ error: "Uno o más productos no están disponibles." }, { status: 400 });

    const merged = input.items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId)!;
      return { product, quantity: item.quantity };
    });
    const totals = calculateSale(merged.map((item) => ({ quantity: item.quantity, unitPrice: Number(item.product.price) })));
    const folio = createFolio("VTA");

    const sale = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of merged) {
        const updatedRows = await tx.product.updateMany({
          where: { id: item.product.id, active: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });
        if (updatedRows.count !== 1) throw new Error(`Existencia insuficiente para ${item.product.name}.`);
        const updated = await tx.product.findUniqueOrThrow({ where: { id: item.product.id } });
        await tx.inventoryMovement.create({
          data: {
            productId: item.product.id,
            type: InventoryMovementType.SALE,
            quantity: -item.quantity,
            previousStock: updated.stock + item.quantity,
            newStock: updated.stock,
            reference: folio
          }
        });
      }

      return tx.sale.create({
        data: {
          folio,
          idempotencyKey: input.idempotencyKey,
          branchId: user.branchId!,
          userId: user.id,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
          items: {
            create: merged.map((item) => ({
              productId: item.product.id,
              description: item.product.name,
              quantity: item.quantity,
              unitPrice: item.product.price,
              total: Number(item.product.price) * item.quantity
            }))
          },
          payments: { create: { method: input.paymentMethod as PaymentMethod, amount: totals.total } }
        }
      });
    });

    await recordAudit({ actorUserId: user.id, action: "SALE_CREATE", entityType: "Sale", entityId: sale.id, metadata: { folio: sale.folio, total: totals.total } });
    return NextResponse.json({ folio: sale.folio, total: totals.total });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No fue posible completar la venta." }, { status: 400 });
  }
}
