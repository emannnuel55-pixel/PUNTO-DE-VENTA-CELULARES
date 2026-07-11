
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Role, RepairStatus, MessageSenderType, InventoryMovementType } from "../generated/prisma/enums";
import { hash } from "@node-rs/argon2";
import { createHmac } from "node:crypto";

if (process.env.NODE_ENV === "production" || process.env.ALLOW_DEMO_SEED !== "true") {
  throw new Error("Seed demo bloqueado. Usa ALLOW_DEMO_SEED=true solamente en desarrollo.");
}
if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL");
const accessSecret = process.env.ACCESS_CODE_SECRET || "demo-access-code-secret-local-solamente-no-produccion-1234567890";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const passwordHash = await hash("LinoemDemo2026!", {
  algorithm: 2, memoryCost: 19456, timeCost: 3, parallelism: 1, outputLen: 32
});
const normalize = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");
const demoCode = "LCR-7K9P-2M8Q";
const normalizedCode = normalize(demoCode);
const accessCodeHash = await hash(normalizedCode, {
  algorithm: 2, memoryCost: 19456, timeCost: 3, parallelism: 1, outputLen: 32
});
const accessCodeLookup = createHmac("sha256", accessSecret).update(normalizedCode).digest("hex");

const branch = await db.branch.upsert({
  where: { code: "MATRIZ" },
  update: {},
  create: { code: "MATRIZ", name: "Sucursal Matriz", address: "Ciudad Juárez, Chihuahua", phone: "656 410 1273" }
});

const admin = await db.user.upsert({
  where: { email: "admin@linoem.mx" },
  update: { passwordHash, active: true },
  create: { name: "Administrador LINOEM", email: "admin@linoem.mx", passwordHash, role: Role.OWNER, branchId: branch.id }
});
const tecnico = await db.user.upsert({
  where: { email: "tecnico@linoem.mx" },
  update: { passwordHash, active: true },
  create: { name: "Técnico Principal", email: "tecnico@linoem.mx", passwordHash, role: Role.TECHNICIAN, branchId: branch.id }
});
await db.user.upsert({
  where: { email: "ventas@linoem.mx" },
  update: { passwordHash, active: true },
  create: { name: "Ventas Mostrador", email: "ventas@linoem.mx", passwordHash, role: Role.SALES, branchId: branch.id }
});

let customer = await db.customer.findFirst({ where: { email: "cliente.demo@example.com" } });
if (!customer) customer = await db.customer.create({
  data: { firstName: "Cliente", lastName: "Demostración", phone: "6560000000", email: "cliente.demo@example.com", city: "Ciudad Juárez", privacyAccepted: true, privacyVersion: "2026-01" }
});
let device = await db.device.findFirst({ where: { serialNumber: "DEMO-S23-001" } });
if (!device) device = await db.device.create({
  data: { customerId: customer.id, brand: "Samsung", model: "Galaxy S23", color: "Negro", serialNumber: "DEMO-S23-001" }
});
const existingOrder = await db.repairOrder.findUnique({ where: { publicFolio: "PVC-DEMO-0001" } });
const order = existingOrder || await db.repairOrder.create({
  data: {
    publicFolio: "PVC-DEMO-0001",
    branchId: branch.id,
    customerId: customer.id,
    deviceId: device.id,
    receivedById: admin.id,
    technicianId: tecnico.id,
    status: RepairStatus.DIAGNOSING,
    issue: "Pantalla dañada y revisión general.",
    physicalCondition: "Cristal frontal roto; marco sin deformaciones graves.",
    accessories: "Equipo sin cargador ni funda.",
    diagnosis: "Diagnóstico inicial en proceso.",
    initialEstimate: 2200,
    deposit: 500,
    total: 2200,
    accessCodeHash,
    accessCodeLookup,
    accessCodeLast4: normalizedCode.slice(-4),
    updates: {
      create: [
        { userId: admin.id, newStatus: RepairStatus.RECEIVED, sequence: 1, comment: "Equipo recibido y documentado." },
        { userId: tecnico.id, previousStatus: RepairStatus.RECEIVED, newStatus: RepairStatus.DIAGNOSING, sequence: 2, comment: "El técnico inició el diagnóstico." }
      ]
    },
    messages: {
      create: { senderType: MessageSenderType.SYSTEM, body: "Bienvenido al seguimiento privado de su reparación." }
    }
  }
});

const products = [
  { sku: "PANT-SAM-S23", name: "Pantalla Samsung Galaxy S23", category: "Pantallas", brand: "Samsung", cost: 1450, price: 2200, stock: 4, minimumStock: 2 },
  { sku: "BAT-IPH-13", name: "Batería compatible iPhone 13", category: "Baterías", brand: "Apple", cost: 520, price: 950, stock: 7, minimumStock: 3 },
  { sku: "CABLE-USBC-1M", name: "Cable USB-C reforzado 1 m", category: "Accesorios", brand: "LINOEM", cost: 65, price: 180, stock: 18, minimumStock: 5 },
  { sku: "MICA-UNIV", name: "Mica protectora universal", category: "Protectores", brand: "Genérica", cost: 20, price: 100, stock: 25, minimumStock: 8 }
];
for (const item of products) {
  const product = await db.product.upsert({
    where: { sku: item.sku },
    update: {},
    create: { ...item, branchId: branch.id }
  });
  const movement = await db.inventoryMovement.findFirst({ where: { productId: product.id, type: InventoryMovementType.INITIAL } });
  if (!movement) await db.inventoryMovement.create({ data: { productId: product.id, type: InventoryMovementType.INITIAL, quantity: item.stock, previousStock: 0, newStock: item.stock, reference: "SEED-DEMO" } });
}

await db.systemSetting.upsert({ where: { key: "business_name" }, update: {}, create: { key: "business_name", value: "PUNTO DE VENTA CELULARES" } });
await db.systemSetting.upsert({ where: { key: "company_name" }, update: {}, create: { key: "company_name", value: "LINOEM DEVELOPMENT" } });
console.log(`Seed completo. Orden demo: ${order.publicFolio}. Código: ${demoCode}`);
await db.$disconnect();
