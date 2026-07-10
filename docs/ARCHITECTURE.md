# Arquitectura

La aplicación utiliza un monolito modular full-stack con Next.js y PostgreSQL. Las páginas del panel y las acciones del servidor comparten una sola fuente de verdad mediante Prisma ORM.

## Capas

1. **Presentación:** App Router, componentes React y CSS responsivo.
2. **Aplicación:** Server Actions y Route Handlers.
3. **Dominio:** reglas de estados, dinero, códigos de acceso y permisos.
4. **Persistencia:** Prisma ORM 7 con PostgreSQL.
5. **Operación:** Docker, Railway, health check, migraciones y CI.

## Flujo de reparación

Recepción → diagnóstico → cotización → autorización → reparación → pruebas → pago → entrega.

Los avances se guardan antes de ser mostrados. El portal del cliente consulta eventos persistidos y actualiza la interfaz mediante SSE.
