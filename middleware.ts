import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const mode = process.env.APP_MODE?.toLowerCase();
  const { pathname } = request.nextUrl;

  // Si no hay modo configurado (desarrollo local), permitimos todo.
  if (!mode) return NextResponse.next();

  // MODO ADMIN: Bloquear página principal (catálogo), seguimiento y cliente, forzar a ir a /login
  if (mode === "admin") {
    if (pathname === "/" || pathname.startsWith("/seguimiento") || pathname.startsWith("/cliente")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // MODO CLIENT: Bloquear rutas de empleados/admin, forzar a ir al inicio /
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

  return NextResponse.next();
}

export const config = {
  // Ignorar rutas de la API (para que el webhook y endpoints sigan funcionando)
  // Ignorar archivos estáticos (_next, imágenes, favicon, etc.)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ],
};
