# Configuración de Railway — Punto de Venta Celulares

## Servicios necesarios

1. Servicio de la aplicación conectado al repositorio `emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES`.
2. Servicio PostgreSQL dentro del mismo proyecto.

## Variables del servicio de aplicación

Agrega estas variables en **Variables**:

- `DATABASE_URL`: referencia al `DATABASE_URL` del servicio PostgreSQL.
- `SESSION_SECRET`: valor aleatorio de 64 caracteres o más.
- `ACCESS_CODE_SECRET`: otro valor aleatorio independiente de 64 caracteres o más.
- `NEXT_PUBLIC_APP_NAME=PUNTO DE VENTA CELULARES`
- `NEXT_PUBLIC_COMPANY_NAME=LINOEM DEVELOPMENT`
- `NODE_ENV=production`
- `ALLOW_DEMO_SEED=false`

El generador crea `RAILWAY_VARIABLES_PRIVADAS.txt` con secretos nuevos. Ese archivo está excluido de Git y no debe subirse al repositorio.

## Despliegue

Railway utilizará el `Dockerfile`, ejecutará las migraciones con `npm run start:railway` y comprobará `/api/health`.

## Portales

- Cliente: `/seguimiento` y `/cliente`
- Trabajadores: `/trabajadores` o `/panel/trabajador`
- Administrador: `/administrador` o `/panel/administrador`
