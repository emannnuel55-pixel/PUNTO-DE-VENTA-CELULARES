import { NextResponse } from "next/server";
import { destroyEmployeeSession } from "@/lib/auth";
export async function POST(request:Request){await destroyEmployeeSession();return NextResponse.redirect(new URL("/login",request.url),303);}
