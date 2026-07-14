import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    });
    return NextResponse.json({ success: true, users });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack });
  }
}

export const dynamic = "force-dynamic";
