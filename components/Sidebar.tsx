"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  UserCog,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { Role } from "@/generated/prisma/enums";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  { href: "/panel/usuarios", label: "Usuarios", icon: UserCog, roles: [Role.OWNER, Role.ADMIN] },
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
  const pathname = usePathname();
  const visibleItems = items.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ paddingBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: "20px" }}>
        <AppLogo compact />
      </div>
      
      <div className="sidebar-user" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={user.name}>
            {user.name}
          </strong>
          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>{roleNames[user.role]}</span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="nav-list" style={{ marginTop: "10px" }}>
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link 
              className={`nav-link ${isActive ? "active" : ""}`} 
              href={href} 
              key={href}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                color: isActive ? "#3b82f6" : "#94a3b8",
                fontWeight: isActive ? "700" : "500",
                background: isActive ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)" : "transparent",
                borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                transition: "all 0.2s ease",
                textDecoration: "none"
              }}
            >
              <Icon size={18} style={{ color: isActive ? "#3b82f6" : "#64748b" }} />
              <span style={{ fontSize: "0.9rem" }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom" style={{ marginTop: "auto", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "16px" }}>
        <Link 
          className="nav-link" 
          href="/" 
          target="_blank"
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", color: "#94a3b8", textDecoration: "none" }}
        >
          <ExternalLink size={16} />
          <span style={{ fontSize: "0.85rem" }}>Portal público</span>
        </Link>
        <form action="/api/auth/logout" method="post" style={{ marginTop: "8px" }}>
          <button 
            className="nav-link sidebar-logout" 
            type="submit"
            style={{ 
              width: "100%", 
              border: "none", 
              background: "transparent", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "10px 16px", 
              color: "#ef4444", 
              textAlign: "left" 
            }}
          >
            <LogOut size={16} />
            <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Cerrar sesión</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
