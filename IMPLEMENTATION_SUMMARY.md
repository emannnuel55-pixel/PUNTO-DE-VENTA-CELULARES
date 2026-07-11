# Resumen de implementación

## Proyecto

**PUNTO DE VENTA CELULARES**, desarrollado con identidad visual de LINOEM DEVELOPMENT.

## Implementado

- Aplicación full-stack Next.js 16.2 y TypeScript.
- PostgreSQL con Prisma ORM 7.
- Autenticación de empleados con Argon2id y sesiones persistentes.
- Control de acceso por rol.
- Clientes, dispositivos, reparaciones, historial de estados y asignaciones.
- Códigos de acceso de 12 caracteres con hash Argon2id y búsqueda HMAC.
- Portal privado del cliente.
- Mensajes y cotizaciones adicionales aceptables o rechazables.
- Actualización automática sin recarga mediante Server-Sent Events y consultas persistidas.
- Productos, existencias, ajustes y movimientos.
- Punto de venta con validación y descuento transaccional de inventario.
- Auditoría de operaciones.
- Docker, Railway, GitHub Actions y scripts de subida.
- Pruebas unitarias para dinero, códigos y estados.

## Limitaciones conocidas antes de producción

- La entrega usa SSE con consulta de base de datos para actualización automática. Para múltiples réplicas de alta escala se recomienda Redis Pub/Sub o WebSockets dedicados.
- No incluye facturación CFDI, timbrado de nómina ni almacenamiento de tarjetas.
- Los pagos con tarjeta se registran como terminal externa; debe integrarse un proveedor certificado para cobros en línea.
- No se afirma certificación ISO ni puntuación Lighthouse no ejecutada en un dominio real.
- Fotografías y adjuntos deben integrarse con almacenamiento S3 y antivirus antes de aceptar archivos reales.
- MFA/WebAuthn está preparado como mejora de endurecimiento, no habilitado en este MVP.
