const required = ["DATABASE_URL", "SESSION_SECRET", "ACCESS_CODE_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Faltan variables: ${missing.join(", ")}`);
  process.exit(1);
}
if ((process.env.SESSION_SECRET || "").length < 48 || (process.env.ACCESS_CODE_SECRET || "").length < 48) {
  console.error("SESSION_SECRET y ACCESS_CODE_SECRET deben tener al menos 48 caracteres.");
  process.exit(1);
}
console.log("Variables obligatorias verificadas.");
