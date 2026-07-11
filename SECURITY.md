# Seguridad

## Controles incluidos

- Contraseñas Argon2id.
- Sesiones aleatorias almacenadas por hash y revocables.
- Cookies HttpOnly, SameSite=Lax y Secure en producción.
- Código de cliente almacenado con Argon2id; índice HMAC independiente para localizar la orden.
- Control de acceso en servidor.
- Validación Zod.
- Consultas Prisma parametrizadas.
- Encabezados de seguridad.
- Auditoría de operaciones críticas.
- Transacciones para venta e inventario.
- No se almacenan PAN ni CVV.

## Reporte responsable

No publiques vulnerabilidades en una incidencia pública. Reporta de forma privada al propietario del repositorio.
