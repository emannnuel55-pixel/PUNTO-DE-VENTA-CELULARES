# Crear el primer administrador

La base de producción inicia sin credenciales demo. Para crear el propietario:

```powershell
$env:DATABASE_URL="postgresql://..."
$env:BOOTSTRAP_ADMIN_EMAIL="propietario@dominio.com"
$env:BOOTSTRAP_ADMIN_PASSWORD="UnaContraseñaSeguraDe12CaracteresOMas"
$env:BOOTSTRAP_ADMIN_NAME="Propietario LINOEM"
$env:BOOTSTRAP_BRANCH_CODE="MATRIZ"
$env:BOOTSTRAP_BRANCH_NAME="Sucursal Matriz"
npm run admin:bootstrap
```

En Railway puedes usar una ejecución temporal o la consola de un despliegue activo. Elimina `BOOTSTRAP_ADMIN_PASSWORD` cuando el comando termine.
