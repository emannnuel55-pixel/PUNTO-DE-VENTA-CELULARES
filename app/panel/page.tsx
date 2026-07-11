import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/auth";

const adminRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER];

export const dynamic = "force-dynamic";

export default async function PanelHomePage() {
  const user = await requireUser();
  redirect(adminRoles.includes(user.role) ? "/panel/administrador" : "/panel/trabajador");
}
