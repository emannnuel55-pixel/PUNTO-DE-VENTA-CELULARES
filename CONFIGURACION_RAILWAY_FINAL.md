# Railway — lista final de verificación

- [ ] Servicio PostgreSQL creado.
- [ ] `DATABASE_URL` enlazada como `${{Postgres.DATABASE_URL}}`.
- [ ] `SESSION_SECRET` y `ACCESS_CODE_SECRET` son diferentes y tienen 48+ caracteres.
- [ ] `NODE_ENV=production`.
- [ ] Root Directory vacío.
- [ ] Builder detecta `Dockerfile`.
- [ ] Start Command `npm run start:railway` o vacío para usar `railway.json`.
- [ ] Healthcheck `/api/health`.
- [ ] Target Port `8080`.
- [ ] El despliegue corresponde al último commit de `main`.

Prueba final:

```text
https://TU-DOMINIO.up.railway.app/api/health
```
