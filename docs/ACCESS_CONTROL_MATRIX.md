# Matriz de acceso resumida

| Módulo | Propietario/Admin | Recepción | Técnico | Ventas | Almacén | Finanzas | Auditor |
|---|---:|---:|---:|---:|---:|---:|---:|
| Dashboard | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Clientes | CRUD | CRUD | Lectura | CRUD | Lectura | Lectura | Lectura |
| Reparaciones | CRUD | CRUD | Avances | Lectura | Lectura | Lectura | Lectura |
| Inventario | CRUD | Lectura | Lectura | Ajustes autorizados | CRUD | Lectura | Lectura |
| Punto de venta | Sí | Sí | No | Sí | No | Lectura | Lectura |
| Auditoría | Sí | No | No | No | No | No | Lectura |
| Configuración | Sí | No | No | No | No | No | No |

Todas las operaciones de escritura se vuelven a validar en el servidor.
