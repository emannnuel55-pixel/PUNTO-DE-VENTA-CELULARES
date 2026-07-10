import { NextResponse } from "next/server";
import { destroyClientSession } from "@/lib/customer-auth";
export async function POST(request:Request){await destroyClientSession();return NextResponse.redirect(new URL("/seguimiento",request.url),303);}
