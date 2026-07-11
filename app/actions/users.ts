"use server";

import { revalidatePath } from "next/cache";
import { hash } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { recordAudit } from "@/lib/audit";

const administrativeRoles: Role[] = [Role.OWNER, Role.ADMIN];

async function createPasswordHash(password: string) {
  return hash(password, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  });
}

export async function createUser(formData: FormData) {
  const adminUser = await requireUser(administrativeRoles);
  
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role")) as Role;
  
  if (!name || name.length < 3) throw new Error("Nombre inválido (mínimo 3 caracteres).");
  if (!email || !email.includes("@")) throw new Error("Correo electrónico inválido.");
  if (!password || password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
  if (!Object.values(Role).includes(role)) throw new Error("Rol inválido.");

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) throw new Error("El correo electrónico ya está registrado.");

  const passwordHash = await createPasswordHash(password);

  const created = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      active: true,
      branchId: adminUser.branchId
    }
  });

  await recordAudit({
    actorUserId: adminUser.id,
    action: "USER_CREATE",
    entityType: "User",
    entityId: created.id,
    metadata: { email, role }
  });

  revalidatePath("/panel/usuarios");
}

export async function resetUserPassword(userId: string, formData: FormData) {
  const adminUser = await requireUser(administrativeRoles);
  const password = String(formData.get("password") || "");

  if (!password || password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");

  const passwordHash = await createPasswordHash(password);

  await db.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  await recordAudit({
    actorUserId: adminUser.id,
    action: "USER_PASSWORD_RESET",
    entityType: "User",
    entityId: userId
  });

  revalidatePath("/panel/usuarios");
}

export async function updateUserRole(userId: string, formData: FormData) {
  const adminUser = await requireUser(administrativeRoles);
  const role = String(formData.get("role")) as Role;

  if (!Object.values(Role).includes(role)) throw new Error("Rol inválido.");

  await db.user.update({
    where: { id: userId },
    data: { role }
  });

  await recordAudit({
    actorUserId: adminUser.id,
    action: "USER_ROLE_CHANGE",
    entityType: "User",
    entityId: userId,
    metadata: { newRole: role }
  });

  revalidatePath("/panel/usuarios");
}

export async function toggleUserStatus(userId: string) {
  const adminUser = await requireUser(administrativeRoles);
  
  if (adminUser.id === userId) throw new Error("No puedes desactivarte a ti mismo.");

  const target = await db.user.findUniqueOrThrow({ where: { id: userId } });

  const updated = await db.user.update({
    where: { id: userId },
    data: { active: !target.active }
  });

  await recordAudit({
    actorUserId: adminUser.id,
    action: updated.active ? "USER_ACTIVATE" : "USER_DEACTIVATE",
    entityType: "User",
    entityId: userId
  });

  revalidatePath("/panel/usuarios");
}
