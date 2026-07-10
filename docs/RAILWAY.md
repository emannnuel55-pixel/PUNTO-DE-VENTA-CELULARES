# Despliegue en Railway

1. Ejecuta `SUBIR_A_GITHUB_AUTOMATICO.bat`.
2. Crea un proyecto Railway desde el repositorio `punto-de-venta-celulares`.
3. Agrega el servicio PostgreSQL.
4. En el servicio web configura:
   - `DATABASE_URL` usando la variable del PostgreSQL de Railway.
   - `SESSION_SECRET` con al menos 64 caracteres aleatorios.
   - `ACCESS_CODE_SECRET` con otro valor aleatorio independiente.
   - `NODE_ENV=production`.
5. No agregues `ALLOW_DEMO_SEED=true` en producción.
6. Railway detectará `railway.json` y `Dockerfile`.
7. El inicio ejecuta `prisma migrate deploy` antes de `next start`.
8. Verifica `/api/health` y después configura el dominio.

No ejecutes el seed demo en producción.
