import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { salesRoles } from "@/lib/permissions";

export async function GET(request: Request) {
  const logs: string[] = [];
  try {
    logs.push("Starting test...");
    const user = await requireUser(salesRoles);
    logs.push(`User verified: ${user.id}, branchId: ${user.branchId}`);
    
    logs.push("Querying products...");
    const products = await db.product.findMany({
      where: {
        active: true,
        stock: { gt: 0 },
        ...(user.branchId ? { branchId: user.branchId } : {})
      },
      orderBy: { name: "asc" }
    });
    logs.push(`Products queried: ${products.length}`);

    const mapped = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      stock: p.stock
    }));
    logs.push("Mapping successful.");

    return NextResponse.json({ success: true, logs, count: mapped.length });
  } catch (e: any) {
    return NextResponse.json({ success: false, logs, error: e.message, stack: e.stack });
  }
}

export const dynamic = "force-dynamic";
