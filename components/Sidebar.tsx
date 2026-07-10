import Link from "next/link";
import { LayoutDashboard, Users, Wrench, Package, ShoppingCart, ScrollText, Settings, LogOut, ExternalLink } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import type { Role } from "@/generated/prisma/enums";

const items = [
  ["/panel", "Dashboard", LayoutDashboard],
  ["/panel/clientes", "Clientes", Users],
  ["/panel/reparaciones", "Reparaciones", Wrench],
  ["/panel/productos", "Inventario", Package],
  ["/panel/pos", "Punto de venta", ShoppingCart],
  ["/panel/auditoria", "Auditoría", ScrollText],
  ["/panel/configuracion", "Configuración", Settings]
] as const;

export function Sidebar({ user }: { user: { name: string; email: string; role: Role } }) {
  return <aside className="sidebar">
    <div className="sidebar-brand"><AppLogo compact /></div>
    <div className="sidebar-user"><strong>{user.name}</strong><span>{user.role} · {user.email}</span></div>
    <nav className="nav-list">{items.map(([href,label,Icon]) => <Link className="nav-link" href={href} key={href}><Icon size={18}/>{label}</Link>)}</nav>
    <div className="sidebar-bottom">
      <Link className="nav-link" href="/" target="_blank"><ExternalLink size={18}/>Portal público</Link>
      <form action="/api/auth/logout" method="post"><button className="nav-link" style={{width:"100%",border:0,background:"transparent"}} type="submit"><LogOut size={18}/>Cerrar sesión</button></form>
    </div>
  </aside>;
}
