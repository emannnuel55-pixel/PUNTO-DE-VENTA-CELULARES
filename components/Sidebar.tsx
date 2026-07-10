import Link from "next/link";
import {
  Boxes,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings,
  ShoppingCart,
  UserRoundCog,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { Role } from "@/generated/prisma/enums";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

const allRoles = Object.values(Role);
const administrativeRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER];

const items: NavigationItem[] = [
  { href: "/panel/administrador", label: "Panel administrador", icon: UserRoundCog, roles: administrativeRoles },
  { href: "/panel/trabajador", label: "Panel de trabajo", icon: LayoutDashboard, roles: allRoles },
  { href: "/panel/clientes", label: "Clientes", icon: Users, roles: [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.RECEPTION, Role.SALES] },
  { href: "/panel/reparaciones", label: "Reparaciones", icon: Wrench, roles: [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.RECEPTION, Role.TECHNICIAN] },
  { href: "/panel/productos", label: "Inventario", icon: Boxes, roles: [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.WAREHOUSE, Role.SALES] },
  { href: "/panel/pos", label: "Punto de venta", icon: ShoppingCart, roles: [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.RECEPTION, Role.SALES] },
  { href: "/panel/auditoria", label: "Auditoría", icon: ScrollText, roles: [Role.OWNER, Role.ADMIN, Role.AUDITOR] },
  { href: "/panel/configuracion", label: "Configuración", icon: Settings, roles: [Role.OWNER, Role.ADMIN] },
];

const roleNames: Record<Role, string> = {
  OWNER: "Propietario",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  RECEPTION: "Recepción",
  TECHNICIAN: "Técnico",
  SALES: "Ventas",
  WAREHOUSE: "Almacén",
  FINANCE: "Finanzas",
  AUDITOR: "Auditor",
};

export function Sidebar({ user }: { user: { name: string; email: string; role: Role } }) {
  const visibleItems = items.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><AppLogo compact /></div>
      <div className="sidebar-user">
        <strong>{user.name}</strong>
        <span>{roleNames[user.role]} · {user.email}</span>
      </div>
      <nav className="nav-list">
        {visibleItems.map(({ href, label, icon: Icon }) => (
          <Link className="nav-link" href={href} key={href}><Icon size={18} />{label}</Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Link className="nav-link" href="/" target="_blank"><ExternalLink size={18} />Portal público</Link>
        <form action="/api/auth/logout" method="post">
          <button className="nav-link sidebar-logout" type="submit"><LogOut size={18} />Cerrar sesión</button>
        </form>
      </div>
    </aside>
  );
}
