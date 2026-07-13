import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cache en memoria para mitigar ataques de fuerza bruta en Railway
const ipCache = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, limit = 8, windowMs = 60000) {
  const now = Date.now();
  const record = ipCache.get(ip);
  
  if (!record) {
    ipCache.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (now > record.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  record.count += 1;
  if (record.count > limit) {
    return true;
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const mode = process.env.APP_MODE?.toLowerCase();
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // 1. Limitar tasa de peticiones en endpoints sensibles (Fuerza Bruta)
  const isSensitiveEndpoint = 
    pathname.startsWith("/api/customer/access") || 
    pathname.startsWith("/api/auth/login") ||
    (pathname === "/login" && request.method === "POST");

  if (isSensitiveEndpoint) {
    if (isRateLimited(ip, 8, 60000)) { // máximo 8 intentos por minuto por IP
      return new NextResponse(
        JSON.stringify({ error: "Demasiados intentos. Por favor, espera 1 minuto." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Control de accesos según la arquitectura de Railway
  if (mode === "admin") {
    if (pathname === "/" || pathname.startsWith("/seguimiento") || pathname.startsWith("/cliente")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (mode === "client") {
    const adminRoutes = [
      "/login",
      "/panel",
      "/administrador",
      "/trabajadores"
    ];
    
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. Establecer cabeceras HTTP de seguridad
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *; connect-src 'self';"
  );

  return response;
}

export const config = {
  // Asegurar que middleware se ejecute en los endpoints de login y la aplicacion principal
  matcher: [
    "/api/customer/access",
    "/api/auth/login",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ],
};
