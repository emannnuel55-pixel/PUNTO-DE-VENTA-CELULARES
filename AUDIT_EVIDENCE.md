# Evidencia técnica de validación

Fecha de preparación: **11 de julio de 2026**.

## Resultados ejecutados en esta entrega

| Validación | Resultado |
|---|---|
| Estructura y archivos obligatorios | Aprobado |
| `npm ci --no-audit --no-fund` | Aprobado, 498 paquetes |
| ESLint | Aprobado, sin errores |
| Pruebas unitarias de lógica | 3 archivos, 5 de 5 pruebas aprobadas |
| Sintaxis del actualizador Python | Aprobada con `py_compile` |
| Exclusión de secretos | Aprobada mediante `.gitignore` y control adicional del actualizador |
| Docker Compose | Corregido para `localhost:3000` |
| Dockerfile de Railway | Node.js 22, npm 10.9.2, usuario no root, puerto 8080 |

## Pruebas incluidas

- Generación y normalización del código privado.
- Cálculos monetarios en centavos.
- Transiciones permitidas y prohibidas del flujo de reparación.

## Limitación comprobada del entorno de preparación

`prisma generate` intentó descargar el Schema Engine desde `binaries.prisma.sh`, pero el entorno aislado no pudo resolver ese dominio (`EAI_AGAIN`). Por esta razón no se presentan como aprobados aquí `tsc` ni `next build`, ya que ambos requieren primero el cliente Prisma generado.

El actualizador incluido ejecuta esas etapas en la PC del usuario y detiene la subida si cualquiera falla:

```text
npm ci
prisma generate
eslint
tsc
vitest
next build
```

Esta evidencia no equivale a una certificación ISO, PCI DSS, fiscal o de invulnerabilidad.
