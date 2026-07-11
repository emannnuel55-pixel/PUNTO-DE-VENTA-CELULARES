import { NextResponse } from "next/server";
import { destroyClientSession } from "@/lib/customer-auth";
function getAbsoluteUrl(targetPath: string, request: Request): URL {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:8080";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return new URL(targetPath, `${proto}://${host}`);
}

export async function POST(request:Request){
  await destroyClientSession();
  return NextResponse.redirect(getAbsoluteUrl("/seguimiento", request), 303);
}
