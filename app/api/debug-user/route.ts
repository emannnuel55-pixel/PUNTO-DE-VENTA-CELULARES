import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

export const dynamic = "force-dynamic";
