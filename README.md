# PUNTO DE VENTA CELULARES

Plataforma web funcional de **LINOEM DEVELOPMENT** para venta, inventario, clientes, reparaciones, seguimiento privado y auditoría.

## Funciones incluidas

- Inicio de sesión seguro con sesiones revocables y contraseñas Argon2id.
- Roles para propietario, administración, recepción, técnico, ventas, almacén, finanzas y auditoría.
- Panel con indicadores reales de PostgreSQL.
- Clientes y dispositivos.
- Órdenes de reparación con máquina de estados, avances, diagnóstico y técnico asignado.
- Código privado seguro por reparación, almacenado mediante hash.
- Portal del cliente con seguimiento, cotizaciones adicionales, aceptación/rechazo y chat.
- Actualización automática del portal del cliente mediante eventos SSE respaldados por base de datos.
- Catálogo, inventario, ajustes y kardex.
- Punto de venta con validación de stock y transacciones atómicas.
- Auditoría de acciones críticas.
- Docker, Railway, pruebas y scripts de subida automática a GitHub.

## Inicio rápido con PostgreSQL local

1. Instala Node.js 24 LTS, Git y PostgreSQL, o usa Docker Desktop.
2. Copia `.env.example` a `.env`.
3. Ejecuta:

```bash
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Abre `http://localhost:3000`.

## Credenciales demo

Después de ejecutar el seed con `ALLOW_DEMO_SEED=true`:

- Administrador: `admin@linoem.mx`
- Contraseña: `LinoemDemo2026!`
- Técnico: `tecnico@linoem.mx`
- Contraseña: `LinoemDemo2026!`
- Ventas: `ventas@linoem.mx`
- Contraseña: `LinoemDemo2026!`

Seguimiento demo:

- Código: `LCR-7K9P-2M8Q`

Cambia las credenciales antes de usar datos reales. El seed demo se bloquea en producción.

## Docker

En Windows, ejecuta `INICIAR_CON_DOCKER.bat`. El archivo inicia PostgreSQL, construye la aplicación, aplica las migraciones, carga datos demo idempotentes y abre el servicio en `http://localhost:3000`.

También puede hacerse manualmente:

```bash
docker compose up -d db
docker compose build app
docker compose run --rm -e NODE_ENV=development -e ALLOW_DEMO_SEED=true app sh -c "npm run db:deploy && npm run db:seed"
docker compose up app
```

## Railway

1. Sube el repositorio a GitHub con `SUBIR_A_GITHUB_AUTOMATICO.bat`.
2. En Railway crea un proyecto desde el repositorio.
3. Agrega PostgreSQL.
4. Configura `DATABASE_URL`, `SESSION_SECRET` y `ACCESS_CODE_SECRET`.
5. No configures `ALLOW_DEMO_SEED` en producción.
6. Railway usará `Dockerfile`, ejecutará migraciones y validará `/api/health`.

## Subida automática a GitHub

En Windows, abre la carpeta y ejecuta:

```text
SUBIR_A_GITHUB_AUTOMATICO.bat
```

El script **no usa winget**. Primero busca GitHub CLI; si no existe, descarga una copia portable desde la publicación oficial de GitHub. Después abre la autenticación oficial en el navegador, crea o actualiza `emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES` y sube la rama `main`. Si la descarga portable está bloqueada, activa automáticamente un modo alternativo con Git y el navegador. No guarda tokens dentro del proyecto.

El proceso genera `SUBIDA_GITHUB_LOG.txt` para diagnosticar cualquier error. La carpeta temporal `.tools` y el log están excluidos del repositorio.

## Seguridad importante

Esta entrega implementa controles técnicos, pero no constituye una certificación ISO, PCI DSS ni una declaración de cumplimiento fiscal. Antes de producción deben configurarse dominio, correo, respaldo, monitoreo, MFA para perfiles privilegiados, almacenamiento externo de evidencias y una revisión legal/fiscal.


## Evidencia de validación

Consulta `AUDIT_EVIDENCE.md` para ver las pruebas ejecutadas, resultados reales y limitaciones del entorno de construcción.
