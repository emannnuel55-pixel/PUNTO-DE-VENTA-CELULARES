import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const logs = await db.auditLog.findMany({
      where: {
        action: { in: ["LOGIN_FAILED", "LOGIN_SUCCESS"] }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return NextResponse.json({ success: true, logs });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

export const dynamic = "force-dynamic";
