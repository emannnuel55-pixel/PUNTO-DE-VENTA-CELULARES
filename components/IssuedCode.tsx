import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { requiredEnv } from "@/lib/env";

export async function IssuedCode({ orderId }: { orderId: string }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("pvc_issued_code")?.value;
  if (!token) return null;

  let code: string | null = null;
  try {
    const secret = new TextEncoder().encode(requiredEnv("SESSION_SECRET"));
    const { payload } = await jwtVerify(token, secret);
    if (payload.repairOrderId === orderId && typeof payload.code === "string") code = payload.code;
  } catch {
    code = null;
  }

  if (!code) return null;
  return <div className="code-box"><strong>CÓDIGO PRIVADO — MOSTRAR UNA SOLA VEZ</strong><code>{code}</code><span>Imprime o entrega este código al cliente. Se eliminará automáticamente de la sesión en cinco minutos.</span></div>;
}
