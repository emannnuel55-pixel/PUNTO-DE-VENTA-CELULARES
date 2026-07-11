# Instrucciones del proyecto completo

## Inicio local recomendado

Ejecuta `INICIAR_CON_DOCKER.bat`. Se iniciarán PostgreSQL y la aplicación en:

```text
http://localhost:3000
```

## Inicio local sin Docker

```bash
npm ci --no-audit --no-fund
npm run db:generate
npm run db:deploy
npm run dev
```

La base indicada por `DATABASE_URL` debe existir antes de ejecutar `db:deploy`.

## Compilar y subir

Ejecuta `EJECUTAR_ACTUALIZADOR_GITHUB.bat`.

El actualizador crea un respaldo, genera Prisma Client, ejecuta ESLint, TypeScript, Vitest y Next.js build. Solo después permite actualizar GitHub.
