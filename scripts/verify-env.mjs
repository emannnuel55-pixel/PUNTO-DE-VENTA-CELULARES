const required = ["DATABASE_URL", "SESSION_SECRET", "ACCESS_CODE_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Faltan variables: ${missing.join(", ")}`);
  process.exit(1);
}

for (const key of ["SESSION_SECRET", "ACCESS_CODE_SECRET"]) {
  if ((process.env[key] || "").length < 48) {
    console.error(`${key} debe contener por lo menos 48 caracteres.`);
    process.exit(1);
  }
}

console.log("Variables obligatorias verificadas.");
