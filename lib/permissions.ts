import { Role } from "@/generated/prisma/enums";

export const panelRoles = Object.values(Role);
export const customerWriteRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.RECEPTION, Role.SALES];
export const repairWriteRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.RECEPTION, Role.TECHNICIAN];
export const salesRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.RECEPTION, Role.SALES];
export const inventoryRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.WAREHOUSE, Role.SALES];
export const auditRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.AUDITOR];

export function hasRole(role: Role, allowed: Role[]) { return allowed.includes(role); }
