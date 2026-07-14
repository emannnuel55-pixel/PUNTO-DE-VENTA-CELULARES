import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const logs: string[] = [];
  try {
    logs.push("Starting database query...");
    const products = await db.product.findMany({
      where: {
        active: true,
        stock: { gt: 0 }
      },
      orderBy: { name: "asc" }
    });
    logs.push(`Query successful. Count: ${products.length}`);

    logs.push("Mapping products...");
    const mapped = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      stock: p.stock
    }));
    logs.push("Mapping successful.");

    return NextResponse.json({ success: true, logs, data: mapped });
  } catch (e: any) {
    return NextResponse.json({ success: false, logs, error: e.message, stack: e.stack });
  }
}

export const dynamic = "force-dynamic";
