# Validación de la entrega

Fecha de preparación: 2026-07-11.

## Comprobado en el entorno de preparación

- Estructura completa: aprobada.
- `package-lock.json` reproducible con `npm ci`: aprobado, 498 paquetes.
- ESLint: aprobado sin errores.
- Pruebas unitarias de dinero, códigos y máquina de estados: 5 de 5 aprobadas.
- Sintaxis del actualizador Python: aprobada con `py_compile`.
- Archivos privados excluidos por `.gitignore` y por el actualizador.
- Docker Compose corregido para publicar `localhost:3000`.
- Dockerfile con Node.js 22 Bookworm Slim, npm 10.9.2, usuario no root y puerto 8080.
- Railway con migraciones y healthcheck `/api/health`.

## Restricción del entorno de preparación

Este entorno no pudo resolver `binaries.prisma.sh`, por lo que `prisma generate` no pudo descargar su Schema Engine. En consecuencia, TypeScript y `next build` no pudieron completarse aquí porque dependen del cliente generado.

El actualizador ejecuta obligatoriamente en la PC del usuario:

```text
npm ci
prisma generate
eslint
tsc
vitest
next build
```

Si cualquiera falla, no continúa con la actualización de GitHub.
