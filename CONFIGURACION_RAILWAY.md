# Configuración de Railway

## Servicios necesarios

1. Aplicación conectada a `emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES`.
2. PostgreSQL dentro del mismo proyecto.

## Variables de la aplicación

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
SESSION_SECRET=<secreto aleatorio distinto de 48 o más caracteres>
ACCESS_CODE_SECRET=<otro secreto aleatorio distinto>
NEXT_PUBLIC_APP_NAME=PUNTO DE VENTA CELULARES
NEXT_PUBLIC_COMPANY_NAME=LINOEM DEVELOPMENT
NODE_ENV=production
```

No agregues `ALLOW_DEMO_SEED=true` en producción.

## Ajustes

```text
Root Directory: vacío
Build Command: vacío
Start Command: npm run start:railway
Healthcheck Path: /api/health
Target Port: 8080
```

El `Dockerfile` fija Node.js 22, npm 10.9.2 y usuario no root. El inicio ejecuta `prisma migrate deploy` antes de levantar Next.js.
