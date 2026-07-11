# PUNTO DE VENTA CELULARES

Plataforma web de **LINOEM DEVELOPMENT** para administrar clientes, dispositivos, reparaciones, seguimiento privado, inventario, ventas y auditoría.

## Portales y rutas

| Portal | Ruta | Uso |
|---|---|---|
| Página pública | `/` | Presentación, acceso a empleados y seguimiento |
| Acceso de empleados | `/login` | Inicio de sesión con correo y contraseña |
| Seguimiento del cliente | `/seguimiento` | Validación del código privado de una reparación |
| Portal del cliente | `/cliente` | Estado, avances, chat y cotizaciones |
| Panel general | `/panel` | Redirección según el rol |
| Panel de administrador | `/panel/administrador` | Indicadores y accesos administrativos |
| Panel de trabajador | `/panel/trabajador` | Trabajo asignado y pendientes |
| Clientes | `/panel/clientes` | Registro y consulta de clientes |
| Reparaciones | `/panel/reparaciones` | Órdenes y flujo de reparación |
| Nueva reparación | `/panel/reparaciones/nueva` | Recepción del equipo |
| Productos | `/panel/productos` | Catálogo e inventario |
| Punto de venta | `/panel/pos` | Carrito, pagos y descuento de stock |
| Auditoría | `/panel/auditoria` | Acciones importantes del sistema |
| Configuración | `/panel/configuracion` | Identidad y opciones del negocio |
| Healthcheck | `/api/health` | Estado de la aplicación y PostgreSQL |

## Funciones implementadas

- Autenticación de empleados con Argon2id y sesiones revocables.
- Roles de propietario, administrador, gerente, recepción, técnico, ventas, almacén, finanzas y auditoría.
- Clientes y dispositivos.
- Recepción y órdenes de reparación.
- Máquina controlada de estados.
- Código privado por orden, almacenado mediante hash.
- Portal del cliente con avances, chat y cotizaciones adicionales.
- Aceptación o rechazo de cargos adicionales.
- Eventos SSE para actualizar el seguimiento.
- Productos, stock y movimientos de inventario.
- Punto de venta con transacciones e idempotencia.
- Auditoría de acciones críticas.
- PostgreSQL, Prisma, migraciones y seed de desarrollo.
- Docker, Railway, GitHub Actions y scripts para Windows.

## Requisitos locales

- Node.js **22 LTS**.
- npm 10.9.2 o compatible.
- Git for Windows.
- PostgreSQL 17, o Docker Desktop.
- Python 3 únicamente para el actualizador automático.

## Inicio rápido con Docker

En Windows ejecuta:

```text
INICIAR_CON_DOCKER.bat
```

El script construye la aplicación, inicia PostgreSQL, aplica migraciones, carga datos demo y publica:

```text
http://localhost:3000
```

Credenciales demo, solo después del seed de desarrollo:

```text
Administrador: admin@linoem.mx
Técnico: tecnico@linoem.mx
Ventas: ventas@linoem.mx
Contraseña: LinoemDemo2026!
Código de seguimiento: LCR-7K9P-2M8Q
```

No habilites `ALLOW_DEMO_SEED=true` en producción.

## Inicio local sin Docker

1. Crea una base PostgreSQL.
2. Copia `.env.example` como `.env`.
3. Corrige `DATABASE_URL` y genera dos secretos diferentes de al menos 48 caracteres.
4. Ejecuta:

```bash
npm ci --no-audit --no-fund
npm run db:generate
npm run db:deploy
npm run dev
```

Para cargar el seed demo en desarrollo:

```powershell
$env:NODE_ENV="development"
$env:ALLOW_DEMO_SEED="true"
npm run db:seed
```

## Crear el primer propietario en producción

Configura temporalmente estas variables en tu terminal o en un servicio de ejecución controlado:

```text
BOOTSTRAP_ADMIN_EMAIL=tu-correo@dominio.com
BOOTSTRAP_ADMIN_PASSWORD=UnaContraseñaSeguraDe12CaracteresOMas
BOOTSTRAP_ADMIN_NAME=Propietario LINOEM
BOOTSTRAP_BRANCH_CODE=MATRIZ
BOOTSTRAP_BRANCH_NAME=Sucursal Matriz
```

Después ejecuta:

```bash
npm run admin:bootstrap
```

Elimina inmediatamente `BOOTSTRAP_ADMIN_PASSWORD` después de crear la cuenta.

## Compilar y actualizar GitHub automáticamente

Ejecuta:

```text
EJECUTAR_ACTUALIZADOR_GITHUB.bat
```

El programa:

1. Detecta la copia completa del proyecto.
2. Crea un respaldo ZIP.
3. Instala dependencias con npm 10.9.2.
4. Genera Prisma Client.
5. Ejecuta ESLint, TypeScript, Vitest y Next.js build.
6. Excluye `.env`, secretos, logs, respaldos, `node_modules` y `.next`.
7. Crea una rama de respaldo del estado remoto.
8. Actualiza `main` con todos los archivos completos.

Destino configurado:

```text
https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES
```

## Railway

Crea PostgreSQL y configura estas variables en el servicio de la aplicación:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
SESSION_SECRET=<secreto aleatorio de 48 o más caracteres>
ACCESS_CODE_SECRET=<otro secreto aleatorio>
NEXT_PUBLIC_APP_NAME=PUNTO DE VENTA CELULARES
NEXT_PUBLIC_COMPANY_NAME=LINOEM DEVELOPMENT
NODE_ENV=production
```

Configuración esperada:

```text
Builder: Dockerfile
Root Directory: vacío
Build Command: vacío
Start Command: npm run start:railway
Healthcheck: /api/health
Target Port: 8080
```

El contenedor ejecuta las migraciones antes de iniciar Next.js.

## Seguridad

Esta entrega aplica controles técnicos razonables, pero no representa una certificación ISO, PCI DSS ni fiscal. Antes de operar con datos reales configura respaldos, monitoreo, dominio, correo, almacenamiento de evidencias y revisión legal/fiscal.

## Corrección del acceso inicial en Railway

Si el login indica que el administrador está pendiente de configurar, PostgreSQL todavía no contiene usuarios. Consulta `CORREGIR_LOGIN_RAILWAY.md` y configura temporalmente las variables `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` y `BOOTSTRAP_CREATE_STAFF`. El arranque crea o actualiza las cuentas sin borrar el resto de los datos.
