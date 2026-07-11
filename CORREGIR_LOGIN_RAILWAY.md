# CORREGIR LOGIN EN RAILWAY

El login puede rechazar `admin@linoem.mx` cuando PostgreSQL todavía no contiene usuarios.
El seed demo está bloqueado intencionalmente en producción.

## Variables temporales

En Railway abre el servicio de la aplicación, entra a **Variables** y agrega:

```text
BOOTSTRAP_ADMIN_EMAIL=admin@linoem.mx
BOOTSTRAP_ADMIN_PASSWORD=LinoemDemo2026!
BOOTSTRAP_ADMIN_NAME=Administrador LINOEM
BOOTSTRAP_BRANCH_CODE=MATRIZ
BOOTSTRAP_BRANCH_NAME=Sucursal Matriz
BOOTSTRAP_CREATE_STAFF=true
```

Conserva las variables normales:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
SESSION_SECRET=<secreto diferente de 48 o más caracteres>
ACCESS_CODE_SECRET=<otro secreto diferente de 48 o más caracteres>
NODE_ENV=production
```

Después pulsa **Deploy** o **Redeploy**. El arranque creará o actualizará:

| Rol | Correo | Contraseña temporal |
|---|---|---|
| Propietario | `admin@linoem.mx` | `LinoemDemo2026!` |
| Técnico | `tecnico@linoem.mx` | `LinoemDemo2026!` |
| Ventas | `ventas@linoem.mx` | `LinoemDemo2026!` |

Cuando confirmes que el acceso funciona, elimina de Railway:

```text
BOOTSTRAP_ADMIN_PASSWORD
BOOTSTRAP_CREATE_STAFF
```

También puedes eliminar todas las variables `BOOTSTRAP_*`. Los usuarios permanecerán en PostgreSQL.
No actives `ALLOW_DEMO_SEED=true` en producción.
