import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      application: "PUNTO DE VENTA CELULARES",
      database: "ok",
      responseTimeMs: Date.now() - startedAt,
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      status: "degraded",
      application: "PUNTO DE VENTA CELULARES",
      database: "error",
      responseTimeMs: Date.now() - startedAt,
      time: new Date().toISOString(),
    }, { status: 503 });
  }
}
