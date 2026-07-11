const isProduction = process.env.NODE_ENV === "production";

export function requiredEnv(name: "DATABASE_URL" | "SESSION_SECRET" | "ACCESS_CODE_SECRET") {
  const value = process.env[name];
  // Si la variable no existe, retornar un placeholder vacío durante el build.
  // En runtime real (start:railway), las variables siempre estarán presentes.
  if (!value) {
    // Solo explotar si hay un PORT definido (indica que el servidor está corriendo de verdad).
    if (process.env.PORT) {
      throw new Error(`Falta la variable obligatoria ${name}`);
    }
    return `__PLACEHOLDER_${name}__`;
  }
  if ((name === "SESSION_SECRET" || name === "ACCESS_CODE_SECRET") && isProduction && process.env.PORT && value.length < 48) {
    throw new Error(`${name} debe tener al menos 48 caracteres en producción.`);
  }
  return value;
}

export const appName = process.env.NEXT_PUBLIC_APP_NAME || "PUNTO DE VENTA CELULARES";
export const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "LINOEM DEVELOPMENT";
