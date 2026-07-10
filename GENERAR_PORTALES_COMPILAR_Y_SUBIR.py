#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador y actualizador de portales para PUNTO DE VENTA CELULARES.

Funciones principales:
- Localiza el proyecto Next.js.
- Crea respaldo de los archivos que modificará.
- Genera portal del cliente, portal de trabajadores y portal de administrador.
- Configura navegación por roles, Railway, Docker, variables y health check.
- Instala dependencias y ejecuta lint, typecheck, pruebas y build.
- Opcionalmente crea commit y sube a GitHub.

Uso recomendado en Windows:
    py GENERAR_PORTALES_COMPILAR_Y_SUBIR.py

También acepta:
    py GENERAR_PORTALES_COMPILAR_Y_SUBIR.py --project "C:\\ruta\\punto-de-venta-celulares" --push
"""

from __future__ import annotations

import argparse
import json
import os
import secrets
import shutil
import subprocess
import sys
import textwrap
import time
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Iterable, Sequence

APP_NAME = "PUNTO DE VENTA CELULARES"
COMPANY_NAME = "LINOEM DEVELOPMENT"
REMOTE_URL = "https://github.com/emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES.git"
LOG_NAME = "GENERADOR_PORTALES_LOG.txt"


class GeneratorError(RuntimeError):
    pass


def dedent(value: str) -> str:
    return textwrap.dedent(value).lstrip("\n").replace("\r\n", "\n")


FILES: dict[str, str] = {
    "app/panel/page.tsx": dedent(r'''
        import { redirect } from "next/navigation";
        import { Role } from "@/generated/prisma/enums";
        import { requireUser } from "@/lib/auth";

        const adminRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER];

        export const dynamic = "force-dynamic";

        export default async function PanelHomePage() {
          const user = await requireUser();
          redirect(adminRoles.includes(user.role) ? "/panel/administrador" : "/panel/trabajador");
        }
    '''),
    "app/panel/administrador/page.tsx": dedent(r'''
        import Link from "next/link";
        import {
          Activity,
          BadgeDollarSign,
          Boxes,
          CircleDollarSign,
          Clock3,
          ShieldCheck,
          Smartphone,
          UsersRound,
          Wrench,
        } from "lucide-react";
        import { Role, RepairStatus } from "@/generated/prisma/enums";
        import { requireUser } from "@/lib/auth";
        import { db } from "@/lib/db";
        import { formatMoney } from "@/lib/money";
        import { repairStatusLabels } from "@/lib/repair-state";
        import { StatCard } from "@/components/StatCard";

        export const dynamic = "force-dynamic";

        const adminRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER];
        const closedStatuses: RepairStatus[] = [RepairStatus.DELIVERED, RepairStatus.CANCELLED];

        export default async function AdministratorDashboardPage() {
          const user = await requireUser(adminRoles);
          const now = new Date();
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

          const [
            salesToday,
            salesMonth,
            activeRepairs,
            waitingApproval,
            readyForDelivery,
            customers,
            employees,
            latestRepairs,
            latestSales,
            recentAudits,
          ] = await Promise.all([
            db.sale.aggregate({ where: { createdAt: { gte: today } }, _sum: { total: true } }),
            db.sale.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { total: true } }),
            db.repairOrder.count({ where: { status: { notIn: closedStatuses } } }),
            db.repairOrder.count({ where: { status: RepairStatus.WAITING_CUSTOMER_APPROVAL } }),
            db.repairOrder.count({ where: { status: RepairStatus.READY_FOR_DELIVERY } }),
            db.customer.count({ where: { active: true } }),
            db.user.count({ where: { active: true } }),
            db.repairOrder.findMany({
              take: 8,
              orderBy: { updatedAt: "desc" },
              include: { customer: true, device: true, technician: true, branch: true },
            }),
            db.sale.findMany({
              take: 6,
              orderBy: { createdAt: "desc" },
              include: { user: true, branch: true },
            }),
            db.auditLog.findMany({
              take: 6,
              orderBy: { createdAt: "desc" },
              include: { actor: { select: { name: true } } },
            }),
          ]);

          const lowProducts = await db.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*)::bigint AS count
            FROM "Product"
            WHERE active = true AND stock <= "minimumStock"
          `;
          const lowStockCount = Number(lowProducts[0]?.count ?? 0);

          return (
            <>
              <section className="portal-banner portal-banner-admin">
                <div>
                  <span className="eyebrow">CENTRO DE CONTROL ADMINISTRATIVO</span>
                  <h2>Bienvenido, {user.name}</h2>
                  <p>Control ejecutivo de ventas, taller, inventario, clientes, seguridad y operación.</p>
                </div>
                <div className="portal-banner-icon"><ShieldCheck size={38} /></div>
              </section>

              <div className="page-header">
                <div>
                  <h2>Resumen general</h2>
                  <p>Información calculada directamente desde PostgreSQL.</p>
                </div>
                <div className="inline-actions">
                  <Link href="/panel/reparaciones/nueva" className="btn btn-primary">Nueva reparación</Link>
                  <Link href="/panel/pos" className="btn btn-secondary">Abrir punto de venta</Link>
                </div>
              </div>

              <section className="stats-grid admin-stats-grid">
                <StatCard label="Ventas de hoy" value={formatMoney(salesToday._sum.total?.toString() ?? 0)} icon={<CircleDollarSign size={20} />} />
                <StatCard label="Ventas del mes" value={formatMoney(salesMonth._sum.total?.toString() ?? 0)} icon={<BadgeDollarSign size={20} />} />
                <StatCard label="Reparaciones activas" value={activeRepairs} icon={<Wrench size={20} />} />
                <StatCard label="Esperando autorización" value={waitingApproval} icon={<Clock3 size={20} />} />
                <StatCard label="Listos para entregar" value={readyForDelivery} icon={<Smartphone size={20} />} />
                <StatCard label="Clientes activos" value={customers} icon={<UsersRound size={20} />} />
                <StatCard label="Empleados activos" value={employees} icon={<Activity size={20} />} />
                <StatCard label="Inventario bajo" value={lowStockCount} icon={<Boxes size={20} />} />
              </section>

              <section className="grid-two admin-dashboard-grid">
                <article className="card">
                  <div className="card-title-row">
                    <div><h3>Reparaciones recientes</h3><p>Últimos equipos con actividad.</p></div>
                    <Link href="/panel/reparaciones" className="text-link">Ver todas</Link>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Folio</th><th>Cliente</th><th>Equipo</th><th>Estado</th><th>Técnico</th></tr></thead>
                      <tbody>
                        {latestRepairs.map((repair) => (
                          <tr key={repair.id}>
                            <td><Link href={`/panel/reparaciones/${repair.id}`}><strong>{repair.publicFolio}</strong></Link></td>
                            <td>{repair.customer.firstName} {repair.customer.lastName}</td>
                            <td>{repair.device.brand} {repair.device.model}</td>
                            <td><span className="badge">{repairStatusLabels[repair.status]}</span></td>
                            <td>{repair.technician?.name ?? "Sin asignar"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="card">
                  <div className="card-title-row"><div><h3>Últimas ventas</h3><p>Movimientos recientes de caja.</p></div></div>
                  {latestSales.length ? (
                    <div className="info-list">
                      {latestSales.map((sale) => (
                        <div className="info-row" key={sale.id}>
                          <span><strong>{sale.folio}</strong><br /><small>{sale.branch.name} · {sale.user.name}</small></span>
                          <strong>{formatMoney(sale.total)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : <div className="empty">Todavía no existen ventas registradas.</div>}
                </article>
              </section>

              <section className="card" style={{ marginTop: 20 }}>
                <div className="card-title-row">
                  <div><h3>Actividad y auditoría</h3><p>Últimos eventos relevantes registrados por el sistema.</p></div>
                  <Link href="/panel/auditoria" className="text-link">Abrir auditoría</Link>
                </div>
                <div className="audit-feed">
                  {recentAudits.map((event) => (
                    <div className="audit-feed-item" key={event.id}>
                      <div className="audit-dot" />
                      <div><strong>{event.action}</strong><span>{event.actor?.name ?? "Sistema"} · {event.entityType}</span></div>
                      <time>{event.createdAt.toLocaleString("es-MX")}</time>
                    </div>
                  ))}
                </div>
              </section>
            </>
          );
        }
    '''),
    "app/panel/trabajador/page.tsx": dedent(r'''
        import Link from "next/link";
        import { ClipboardCheck, Clock3, MessageSquareText, PackageSearch, Smartphone, Wrench } from "lucide-react";
        import type { Prisma } from "@/generated/prisma/client";
        import { Role, RepairStatus } from "@/generated/prisma/enums";
        import { requireUser } from "@/lib/auth";
        import { db } from "@/lib/db";
        import { repairStatusLabels } from "@/lib/repair-state";
        import { StatCard } from "@/components/StatCard";

        export const dynamic = "force-dynamic";

        const closedStatuses: RepairStatus[] = [RepairStatus.DELIVERED, RepairStatus.CANCELLED];

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

        export default async function WorkerDashboardPage() {
          const user = await requireUser();
          const scope: Prisma.RepairOrderWhereInput = {
            status: { notIn: closedStatuses },
          };

          if (user.role === Role.TECHNICIAN) scope.technicianId = user.id;
          else if (user.branchId) scope.branchId = user.branchId;

          const [activeOrders, pendingDiagnosis, waitingApproval, readyDelivery, recentOrders, recentMessages] = await Promise.all([
            db.repairOrder.count({ where: scope }),
            db.repairOrder.count({ where: { ...scope, status: RepairStatus.PENDING_DIAGNOSIS } }),
            db.repairOrder.count({ where: { ...scope, status: RepairStatus.WAITING_CUSTOMER_APPROVAL } }),
            db.repairOrder.count({ where: { ...scope, status: RepairStatus.READY_FOR_DELIVERY } }),
            db.repairOrder.findMany({
              where: scope,
              take: 10,
              orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
              include: { customer: true, device: true, technician: true },
            }),
            db.message.findMany({
              where: user.role === Role.TECHNICIAN
                ? { repairOrder: { technicianId: user.id } }
                : user.branchId
                  ? { repairOrder: { branchId: user.branchId } }
                  : {},
              take: 6,
              orderBy: { createdAt: "desc" },
              include: { repairOrder: { select: { id: true, publicFolio: true } }, senderUser: { select: { name: true } } },
            }),
          ]);

          const createRepairRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.RECEPTION];
          const posRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.RECEPTION, Role.SALES];
          const inventoryRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.WAREHOUSE, Role.SALES];
          const canCreateRepair = createRepairRoles.includes(user.role);
          const canOpenPos = posRoles.includes(user.role);
          const canOpenInventory = inventoryRoles.includes(user.role);

          return (
            <>
              <section className="portal-banner portal-banner-worker">
                <div>
                  <span className="eyebrow">PORTAL DE TRABAJADORES</span>
                  <h2>Hola, {user.name}</h2>
                  <p>{roleNames[user.role]} · {user.branch?.name ?? "Acceso general"}</p>
                </div>
                <div className="portal-banner-icon"><ClipboardCheck size={38} /></div>
              </section>

              <div className="page-header">
                <div><h2>Mi jornada</h2><p>Órdenes, prioridades y accesos relacionados con tu función.</p></div>
                <div className="inline-actions">
                  {canCreateRepair && <Link href="/panel/reparaciones/nueva" className="btn btn-primary">Recibir equipo</Link>}
                  {canOpenPos && <Link href="/panel/pos" className="btn btn-secondary">Abrir POS</Link>}
                  {canOpenInventory && <Link href="/panel/productos" className="btn btn-secondary">Inventario</Link>}
                </div>
              </div>

              <section className="stats-grid worker-stats-grid">
                <StatCard label="Órdenes activas" value={activeOrders} icon={<Wrench size={20} />} />
                <StatCard label="Pendientes de diagnóstico" value={pendingDiagnosis} icon={<Smartphone size={20} />} />
                <StatCard label="Esperando autorización" value={waitingApproval} icon={<Clock3 size={20} />} />
                <StatCard label="Listos para entrega" value={readyDelivery} icon={<PackageSearch size={20} />} />
              </section>

              <section className="grid-two worker-dashboard-grid">
                <article className="card">
                  <div className="card-title-row">
                    <div><h3>Cola de trabajo</h3><p>Ordenada por prioridad y actividad reciente.</p></div>
                    <Link href="/panel/reparaciones" className="text-link">Abrir reparaciones</Link>
                  </div>
                  <div className="work-queue">
                    {recentOrders.length ? recentOrders.map((repair) => (
                      <Link className="work-queue-item" href={`/panel/reparaciones/${repair.id}`} key={repair.id}>
                        <div className={`priority-indicator priority-${repair.priority}`} />
                        <div className="work-queue-main">
                          <strong>{repair.publicFolio} · {repair.device.brand} {repair.device.model}</strong>
                          <span>{repair.customer.firstName} {repair.customer.lastName}</span>
                        </div>
                        <div className="work-queue-status">
                          <span className="badge">{repairStatusLabels[repair.status]}</span>
                          <small>{repair.technician?.name ?? "Sin asignar"}</small>
                        </div>
                      </Link>
                    )) : <div className="empty">No hay órdenes activas en tu alcance.</div>}
                  </div>
                </article>

                <article className="card">
                  <div className="card-title-row"><div><h3>Mensajes recientes</h3><p>Comunicación vinculada a las órdenes.</p></div><MessageSquareText size={22} /></div>
                  <div className="message-feed">
                    {recentMessages.length ? recentMessages.map((message) => (
                      <Link href={`/panel/reparaciones/${message.repairOrder.id}`} className="message-feed-item" key={message.id}>
                        <strong>{message.repairOrder.publicFolio}</strong>
                        <span>{message.body.length > 105 ? `${message.body.slice(0, 105)}…` : message.body}</span>
                        <small>{message.senderUser?.name ?? (message.senderType === "CUSTOMER" ? "Cliente" : "Sistema")} · {message.createdAt.toLocaleString("es-MX")}</small>
                      </Link>
                    )) : <div className="empty">Todavía no hay mensajes.</div>}
                  </div>
                </article>
              </section>
            </>
          );
        }
    '''),
    "app/administrador/page.tsx": dedent(r'''
        import { redirect } from "next/navigation";

        export default function AdministratorShortcutPage() {
          redirect("/panel/administrador");
        }
    '''),
    "app/trabajadores/page.tsx": dedent(r'''
        import { redirect } from "next/navigation";

        export default function WorkersShortcutPage() {
          redirect("/panel/trabajador");
        }
    '''),
    "components/Sidebar.tsx": dedent(r'''
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
    '''),
    "app/api/auth/login/route.ts": dedent(r'''
        import { NextResponse } from "next/server";
        import { Role } from "@/generated/prisma/enums";
        import { db } from "@/lib/db";
        import { loginSchema } from "@/lib/validation";
        import { verifyPassword } from "@/lib/security";
        import { createEmployeeSession } from "@/lib/auth";
        import { recordAudit } from "@/lib/audit";

        const adminRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER];

        export async function POST(request: Request) {
          try {
            const form = await request.formData();
            const data = loginSchema.parse(Object.fromEntries(form));
            const user = await db.user.findUnique({ where: { email: data.email } });

            if (!user || !user.active || !(await verifyPassword(user.passwordHash, data.password))) {
              await recordAudit({
                action: "LOGIN_FAILED",
                entityType: "User",
                result: "DENIED",
                metadata: { email: data.email },
              });
              return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
            }

            await createEmployeeSession(user.id);
            await recordAudit({ actorUserId: user.id, action: "LOGIN_SUCCESS", entityType: "User", entityId: user.id });

            const target = adminRoles.includes(user.role) ? "/panel/administrador" : "/panel/trabajador";
            return NextResponse.redirect(new URL(target, request.url), 303);
          } catch {
            return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
          }
        }
    '''),
    "app/login/page.tsx": dedent(r'''
        import { AppLogo } from "@/components/AppLogo";

        export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
          const params = await searchParams;
          const showDemo = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_SEED === "true";

          return (
            <main className="auth-page">
              <section className="auth-brand">
                <AppLogo />
                <h1>Control total de tu tienda y taller.</h1>
                <p>Acceso diferenciado para trabajadores, técnicos, ventas, almacén y administración.</p>
                <div className="auth-role-pills"><span>Administrador</span><span>Trabajadores</span><span>Cliente por código</span></div>
              </section>
              <section className="auth-form-wrap">
                <div className="auth-card">
                  <h2>Acceso de empleados</h2>
                  <p>El sistema abrirá automáticamente el portal correspondiente a tu rol.</p>
                  {params.error && <div className="alert alert-error">Correo o contraseña incorrectos.</div>}
                  <form action="/api/auth/login" method="post" className="form-grid one">
                    <div className="field"><label>Correo</label><input name="email" type="email" autoComplete="username" required placeholder="usuario@empresa.com" /></div>
                    <div className="field"><label>Contraseña</label><input name="password" type="password" autoComplete="current-password" required minLength={8} /></div>
                    <button className="btn btn-primary" type="submit">Entrar a la plataforma</button>
                  </form>
                  {showDemo && <div className="alert alert-info" style={{ marginTop: 18 }}>Desarrollo: admin@linoem.mx / LinoemDemo2026!</div>}
                </div>
              </section>
            </main>
          );
        }
    '''),
    "app/seguimiento/page.tsx": dedent(r'''
        import Link from "next/link";
        import { AppLogo } from "@/components/AppLogo";

        export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
          const params = await searchParams;
          const showDemo = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_SEED === "true";

          return (
            <main className="auth-page">
              <section className="auth-brand">
                <AppLogo />
                <h1>Consulta el avance de tu celular.</h1>
                <p>Ingresa el código privado entregado al recibir tu equipo. La sesión queda limitada exclusivamente a esa orden.</p>
              </section>
              <section className="auth-form-wrap">
                <div className="auth-card">
                  <h2>Seguimiento privado</h2>
                  <p>Escribe el código completo de tu reparación.</p>
                  {params.error && <div className="alert alert-error">Código inválido, vencido o revocado.</div>}
                  <form action="/api/customer/access" method="post" className="form-grid one">
                    <div className="field"><label>Código de acceso</label><input name="code" autoComplete="one-time-code" required minLength={12} maxLength={20} placeholder="ABC-1234-XYZ12" className="tracking-code-input" /></div>
                    <button className="btn btn-primary" type="submit">Consultar mi reparación</button>
                  </form>
                  {showDemo && <div className="alert alert-info" style={{ marginTop: 18 }}>Desarrollo: LCR-7K9P-2M8Q</div>}
                  <Link className="btn btn-ghost full-width-button" href="/">Volver al inicio</Link>
                </div>
              </section>
            </main>
          );
        }
    '''),
    "app/cliente/page.tsx": dedent(r'''
        import { AppLogo } from "@/components/AppLogo";
        import ClientRealtime from "@/app/cliente/ClientRealtime";
        import { decideEstimate, sendCustomerMessage } from "@/app/actions/repair-details";
        import { requireClientOrder } from "@/lib/customer-auth";
        import { formatMoney } from "@/lib/money";
        import { repairStatusLabels, statusProgress } from "@/lib/repair-state";

        export const dynamic = "force-dynamic";

        export default async function ClientPage() {
          const order = await requireClientOrder();
          const progress = statusProgress(order.status);

          if (order.status === "DELIVERED") {
            return (
              <main className="client-shell">
                <div className="client-container">
                  <header className="client-header">
                    <AppLogo />
                    <form action="/api/customer/logout" method="post"><button className="btn btn-secondary">Cerrar</button></form>
                  </header>
                  <section className="client-card delivered-card">
                    <span className="eyebrow">CONSTANCIA DE ENTREGA</span>
                    <div className="page-header client-title-row">
                      <div><h2>Equipo entregado</h2><p>Orden {order.publicFolio}</p></div>
                      <span className="badge success">ENTREGADO</span>
                    </div>
                    <div className="client-summary">
                      <div><span>Equipo</span><strong>{order.device.brand} {order.device.model}</strong></div>
                      <div><span>Fecha de entrega</span><strong>{order.deliveredAt ? order.deliveredAt.toLocaleString("es-MX") : "Registrada"}</strong></div>
                      <div><span>Total</span><strong>{formatMoney(order.total)}</strong></div>
                      <div><span>Sucursal</span><strong>{order.branch.name}</strong></div>
                    </div>
                    <div className="alert alert-info client-delivery-notice">Por seguridad, el chat y los avances detallados dejaron de estar disponibles después de la entrega. Conserva el folio para cualquier garantía.</div>
                  </section>
                </div>
              </main>
            );
          }

          return (
            <main className="client-shell">
              <ClientRealtime />
              <div className="client-container">
                <header className="client-header">
                  <AppLogo />
                  <form action="/api/customer/logout" method="post"><button className="btn btn-secondary">Cerrar seguimiento</button></form>
                </header>

                <section className="client-card client-hero-card">
                  <span className="eyebrow">PORTAL DEL CLIENTE · SEGUIMIENTO PRIVADO</span>
                  <div className="page-header client-title-row">
                    <div><h2>{order.device.brand} {order.device.model}</h2><p>Orden {order.publicFolio}</p></div>
                    <span className="badge success">{repairStatusLabels[order.status]}</span>
                  </div>
                  <div className="progress"><span style={{ width: `${progress}%` }} /></div>
                  <div className="client-summary">
                    <div><span>Avance</span><strong>{progress}%</strong></div>
                    <div><span>Total autorizado</span><strong>{formatMoney(order.total)}</strong></div>
                    <div><span>Anticipo</span><strong>{formatMoney(order.deposit)}</strong></div>
                    <div><span>Fecha estimada</span><strong>{order.promisedAt ? order.promisedAt.toLocaleDateString("es-MX") : "Por confirmar"}</strong></div>
                  </div>
                </section>

                <section className="grid-two client-grid">
                  <article className="client-card">
                    <h3>Avances de reparación</h3>
                    <div className="timeline">
                      {order.updates.map((update) => (
                        <div className="timeline-item" key={update.id}>
                          <strong>{repairStatusLabels[update.newStatus]}</strong>
                          <span>{update.comment}</span>
                          <small>{update.createdAt.toLocaleString("es-MX")}</small>
                        </div>
                      ))}
                    </div>
                  </article>
                  <article className="client-card">
                    <h3>Diagnóstico y servicio</h3>
                    <p>{order.diagnosis ?? "El diagnóstico todavía está en proceso."}</p>
                    <div className="info-row"><span>Técnico asignado</span><strong>{order.technician?.name ?? "Por asignar"}</strong></div>
                    <div className="info-row"><span>Sucursal</span><strong>{order.branch.name}</strong></div>
                    <div className="info-row"><span>Problema reportado</span><strong>{order.issue}</strong></div>
                  </article>
                </section>

                <section className="client-card">
                  <h3>Cotizaciones adicionales</h3>
                  {order.estimates.length ? order.estimates.map((estimate) => (
                    <div className={`estimate-card ${estimate.status === "PENDING" ? "pending" : ""}`} key={estimate.id}>
                      <div className="page-header estimate-title-row">
                        <div><strong>Versión {estimate.version} · {estimate.title}</strong><p>{estimate.reason}</p></div>
                        <span className="badge">{estimate.status}</span>
                      </div>
                      <div className="client-summary">
                        <div><span>Refacciones</span><strong>{formatMoney(estimate.partsAmount)}</strong></div>
                        <div><span>Mano de obra</span><strong>{formatMoney(estimate.laborAmount)}</strong></div>
                        <div><span>Impuestos</span><strong>{formatMoney(estimate.taxAmount)}</strong></div>
                        <div><span>Total adicional</span><strong>{formatMoney(estimate.totalAmount)}</strong></div>
                      </div>
                      {estimate.status === "PENDING" && (
                        <div className="inline-actions estimate-actions">
                          <form action={decideEstimate.bind(null, estimate.id, "ACCEPTED")}><button className="btn btn-primary">ACEPTO LA REPARACIÓN Y EL CARGO ADICIONAL</button></form>
                          <form action={decideEstimate.bind(null, estimate.id, "REJECTED")}><button className="btn btn-danger">NO ACEPTO LA REPARACIÓN ADICIONAL</button></form>
                        </div>
                      )}
                    </div>
                  )) : <div className="empty">No existen cotizaciones adicionales pendientes.</div>}
                </section>

                <section className="client-card">
                  <h3>Mensajes con recepción y técnico</h3>
                  <div className="chat">
                    {order.messages.map((message) => (
                      <div className={`chat-message ${message.senderType === "CUSTOMER" ? "customer" : message.senderType === "SYSTEM" ? "system" : ""}`} key={message.id}>
                        {message.body}
                        <small>{message.senderType === "CUSTOMER" ? "Tú" : message.senderUser?.name ?? "Sistema"} · {message.createdAt.toLocaleString("es-MX")}</small>
                      </div>
                    ))}
                  </div>
                  <form action={sendCustomerMessage} className="form-grid one client-message-form">
                    <div className="field"><textarea name="body" maxLength={3000} placeholder="Escribe un mensaje para recepción o el técnico" required /></div>
                    <button className="btn btn-primary">Enviar mensaje</button>
                  </form>
                </section>
              </div>
            </main>
          );
        }
    '''),
    "lib/audit.ts": dedent(r'''
        import { headers } from "next/headers";
        import type { Prisma } from "@/generated/prisma/client";
        import { db } from "@/lib/db";

        export async function recordAudit(input: {
          actorUserId?: string;
          action: string;
          entityType: string;
          entityId?: string;
          result?: string;
          metadata?: Prisma.InputJsonValue;
        }) {
          const headerStore = await headers();
          await db.auditLog.create({
            data: {
              actorUserId: input.actorUserId,
              action: input.action,
              entityType: input.entityType,
              entityId: input.entityId,
              result: input.result ?? "SUCCESS",
              metadata: input.metadata,
              ipAddress: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim(),
            },
          });
        }
    '''),
    "lib/customer-auth.ts": dedent(r'''
        import { cookies } from "next/headers";
        import { redirect } from "next/navigation";
        import { db } from "@/lib/db";
        import { randomToken, sha256 } from "@/lib/security";

        const COOKIE = "pvc_client";
        const MAX_AGE_SECONDS = 60 * 60 * 4;

        export async function createClientSession(repairOrderId: string) {
          const raw = randomToken();
          await db.clientSession.create({
            data: {
              tokenHash: sha256(raw),
              repairOrderId,
              expiresAt: new Date(Date.now() + MAX_AGE_SECONDS * 1000),
            },
          });
          const cookieStore = await cookies();
          cookieStore.set(COOKIE, raw, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: MAX_AGE_SECONDS,
          });
        }

        export async function getClientOrder() {
          const cookieStore = await cookies();
          const raw = cookieStore.get(COOKIE)?.value;
          if (!raw) return null;

          const session = await db.clientSession.findUnique({
            where: { tokenHash: sha256(raw) },
            include: {
              repairOrder: {
                include: {
                  customer: true,
                  device: true,
                  branch: true,
                  technician: { select: { name: true } },
                  updates: { where: { visibleToCustomer: true }, orderBy: { sequence: "asc" } },
                  messages: {
                    where: { visibleToCustomer: true },
                    orderBy: { createdAt: "asc" },
                    include: { senderUser: { select: { name: true } } },
                  },
                  estimates: { orderBy: { version: "desc" } },
                },
              },
            },
          });

          if (!session || session.expiresAt <= new Date()) return null;
          if (session.repairOrder.accessCodeRevokedAt && session.repairOrder.status !== "DELIVERED") return null;
          return session.repairOrder;
        }

        export async function requireClientOrder() {
          const order = await getClientOrder();
          if (!order) redirect("/seguimiento?error=sesion");
          return order;
        }

        export async function destroyClientSession() {
          const cookieStore = await cookies();
          const raw = cookieStore.get(COOKIE)?.value;
          if (raw) await db.clientSession.deleteMany({ where: { tokenHash: sha256(raw) } });
          cookieStore.delete(COOKIE);
        }
    '''),
    "app/api/health/route.ts": dedent(r'''
        import { NextResponse } from "next/server";
        import { db } from "@/lib/db";

        export const dynamic = "force-dynamic";

        export async function GET() {
          const startedAt = Date.now();
          try {
            await db.$queryRaw`SELECT 1`;
            return NextResponse.json({
              status: "ok",
              application: "PUNTO DE VENTA CELULARES",
              database: "ok",
              responseTimeMs: Date.now() - startedAt,
              time: new Date().toISOString(),
            });
          } catch {
            return NextResponse.json({
              status: "degraded",
              application: "PUNTO DE VENTA CELULARES",
              database: "error",
              responseTimeMs: Date.now() - startedAt,
              time: new Date().toISOString(),
            }, { status: 503 });
          }
        }
    '''),
    "next.config.ts": dedent(r'''
        import type { NextConfig } from "next";

        const securityHeaders = [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline'",
              "connect-src 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ];

        const nextConfig: NextConfig = {
          output: "standalone",
          poweredByHeader: false,
          reactStrictMode: true,
          experimental: { cpus: 2, serverActions: { bodySizeLimit: "2mb" } },
          async headers() {
            return [{ source: "/(.*)", headers: securityHeaders }];
          },
        };

        export default nextConfig;
    '''),
    "railway.json": dedent(r'''
        {
          "$schema": "https://railway.com/railway.schema.json",
          "build": {
            "builder": "DOCKERFILE",
            "dockerfilePath": "Dockerfile"
          },
          "deploy": {
            "startCommand": "npm run start:railway",
            "healthcheckPath": "/api/health",
            "healthcheckTimeout": 120,
            "restartPolicyType": "ON_FAILURE",
            "restartPolicyMaxRetries": 3
          }
        }
    '''),
    "Dockerfile": dedent(r'''
        FROM node:22-alpine AS deps
        WORKDIR /app
        RUN apk add --no-cache openssl libc6-compat
        COPY package.json package-lock.json ./
        RUN npm ci

        FROM deps AS builder
        WORKDIR /app
        ENV NEXT_TELEMETRY_DISABLED=1
        COPY . .
        RUN npm run build

        FROM node:22-alpine AS runner
        WORKDIR /app
        ENV NODE_ENV=production
        ENV NEXT_TELEMETRY_DISABLED=1
        RUN apk add --no-cache openssl libc6-compat \
          && addgroup --system --gid 1001 nodejs \
          && adduser --system --uid 1001 nextjs
        COPY --from=deps /app/node_modules ./node_modules
        COPY --from=builder /app/package.json ./package.json
        COPY --from=builder /app/next.config.ts ./next.config.ts
        COPY --from=builder /app/.next ./.next
        COPY --from=builder /app/public ./public
        COPY --from=builder /app/prisma ./prisma
        COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
        COPY --from=builder /app/generated ./generated
        COPY --from=builder /app/scripts ./scripts
        RUN chown -R nextjs:nodejs /app
        USER nextjs
        EXPOSE 3000
        CMD ["npm", "run", "start:railway"]
    '''),
    "scripts/start-railway.mjs": dedent(r'''
        import { spawn } from "node:child_process";

        function run(command, args) {
          return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
              stdio: "inherit",
              shell: process.platform === "win32",
              env: process.env,
            });
            child.on("error", reject);
            child.on("exit", (code) => code === 0
              ? resolve()
              : reject(new Error(`${command} terminó con código ${code}`)));
          });
        }

        const port = process.env.PORT || "3000";
        await run("npx", ["prisma", "migrate", "deploy"]);
        await run("npx", ["next", "start", "-p", port]);
    '''),
    "scripts/verify-env.mjs": dedent(r'''
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
    '''),
    ".env.example": dedent(r'''
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/punto_venta_celulares?schema=public"
        SESSION_SECRET="GENERA-UN-SECRETO-DIFERENTE-DE-64-CARACTERES-O-MAS"
        ACCESS_CODE_SECRET="GENERA-OTRO-SECRETO-INDEPENDIENTE-DE-64-CARACTERES-O-MAS"
        NEXT_PUBLIC_APP_NAME="PUNTO DE VENTA CELULARES"
        NEXT_PUBLIC_COMPANY_NAME="LINOEM DEVELOPMENT"
        NODE_ENV="development"
        ALLOW_DEMO_SEED="true"
    '''),
    ".gitattributes": dedent(r'''
        * text=auto
        *.sh text eol=lf
        *.bat text eol=crlf
        *.cmd text eol=crlf
        *.ps1 text eol=crlf
        *.png binary
        *.jpg binary
        *.jpeg binary
        *.webp binary
        *.ico binary
    '''),
    "CONFIGURACION_RAILWAY.md": dedent(r'''
        # Configuración de Railway — Punto de Venta Celulares

        ## Servicios necesarios

        1. Servicio de la aplicación conectado al repositorio `emannnuel55-pixel/PUNTO-DE-VENTA-CELULARES`.
        2. Servicio PostgreSQL dentro del mismo proyecto.

        ## Variables del servicio de aplicación

        Agrega estas variables en **Variables**:

        - `DATABASE_URL`: referencia al `DATABASE_URL` del servicio PostgreSQL.
        - `SESSION_SECRET`: valor aleatorio de 64 caracteres o más.
        - `ACCESS_CODE_SECRET`: otro valor aleatorio independiente de 64 caracteres o más.
        - `NEXT_PUBLIC_APP_NAME=PUNTO DE VENTA CELULARES`
        - `NEXT_PUBLIC_COMPANY_NAME=LINOEM DEVELOPMENT`
        - `NODE_ENV=production`
        - `ALLOW_DEMO_SEED=false`

        El generador crea `RAILWAY_VARIABLES_PRIVADAS.txt` con secretos nuevos. Ese archivo está excluido de Git y no debe subirse al repositorio.

        ## Despliegue

        Railway utilizará el `Dockerfile`, ejecutará las migraciones con `npm run start:railway` y comprobará `/api/health`.

        ## Portales

        - Cliente: `/seguimiento` y `/cliente`
        - Trabajadores: `/trabajadores` o `/panel/trabajador`
        - Administrador: `/administrador` o `/panel/administrador`
    '''),
    "PORTALES_GENERADOS.md": dedent(r'''
        # Portales generados

        ## Portal del cliente

        - Acceso mediante código privado.
        - Estado y porcentaje de avance.
        - Diagnóstico y técnico asignado.
        - Cotizaciones adicionales con aceptación o rechazo.
        - Chat vinculado exclusivamente a la reparación.
        - Constancia limitada después de la entrega.

        ## Portal de trabajadores

        - Dashboard personalizado por usuario, rol y sucursal.
        - Cola de órdenes activas.
        - Prioridades, diagnóstico, autorizaciones y entregas.
        - Accesos rápidos según permisos.
        - Mensajes recientes relacionados con las órdenes.

        ## Portal de administrador

        - Ventas del día y del mes.
        - Reparaciones activas y pendientes.
        - Clientes y empleados activos.
        - Inventario bajo.
        - Reparaciones y ventas recientes.
        - Actividad de auditoría.

        ## Separación por permisos

        La visibilidad del menú se adapta al rol. Las páginas administrativas también validan permisos en el servidor mediante `requireUser`, por lo que ocultar un enlace no es la única barrera de autorización.
    '''),
}


CSS_BLOCK = dedent(r'''
/* ===== PORTALES CLIENTE / TRABAJADOR / ADMINISTRADOR — GENERADO AUTOMÁTICAMENTE ===== */
.portal-banner {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
  padding:26px;
  border-radius:22px;
  color:#fff;
  margin-bottom:26px;
  overflow:hidden;
  position:relative;
  box-shadow:0 24px 55px rgba(5,18,72,.18);
}
.portal-banner::after {
  content:"";
  position:absolute;
  width:220px;
  height:220px;
  border-radius:50%;
  right:-65px;
  top:-95px;
  background:rgba(255,255,255,.11);
}
.portal-banner-admin { background:linear-gradient(135deg,#071348,#1b3fc8 62%,#6b28e8); }
.portal-banner-worker { background:linear-gradient(135deg,#061b45,#087cc1 58%,#08b9c8); }
.portal-banner h2 { margin:7px 0 8px; font-size:clamp(1.9rem,4vw,2.8rem); letter-spacing:-.04em; }
.portal-banner p { margin:0; color:#dfe8ff; }
.portal-banner-icon { width:72px; height:72px; border-radius:21px; display:grid; place-items:center; background:rgba(255,255,255,.14); position:relative; z-index:1; flex:0 0 auto; }
.admin-stats-grid { grid-template-columns:repeat(4,minmax(0,1fr)); }
.worker-stats-grid { grid-template-columns:repeat(4,minmax(0,1fr)); }
.admin-dashboard-grid { grid-template-columns:1.35fr .65fr; }
.worker-dashboard-grid { grid-template-columns:1.2fr .8fr; }
.card-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-bottom:16px; }
.card-title-row h3 { margin:0 0 4px; }
.card-title-row p { margin:0; color:var(--muted); font-size:.88rem; }
.text-link { color:var(--blue); font-weight:800; white-space:nowrap; }
.audit-feed,.message-feed,.work-queue { display:grid; gap:10px; }
.audit-feed-item { display:grid; grid-template-columns:auto 1fr auto; gap:12px; align-items:center; padding:12px; border:1px solid var(--border); border-radius:14px; }
.audit-feed-item div:nth-child(2) { display:grid; gap:3px; }
.audit-feed-item span,.audit-feed-item time { color:var(--muted); font-size:.8rem; }
.audit-dot { width:10px; height:10px; border-radius:999px; background:var(--blue); box-shadow:0 0 0 5px #e8efff; }
.work-queue-item { display:grid; grid-template-columns:5px minmax(0,1fr) auto; gap:13px; align-items:center; padding:13px; border:1px solid var(--border); border-radius:15px; background:#fff; transition:.18s ease; }
.work-queue-item:hover { transform:translateY(-1px); border-color:#8ba9ff; box-shadow:0 12px 25px rgba(22,93,255,.09); }
.priority-indicator { width:5px; height:42px; border-radius:999px; background:#80a0f5; }
.priority-1 { background:#e23c4e; }
.priority-2 { background:#f1a522; }
.priority-3 { background:#31a874; }
.work-queue-main { display:grid; gap:4px; min-width:0; }
.work-queue-main strong,.work-queue-main span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.work-queue-main span { color:var(--muted); font-size:.84rem; }
.work-queue-status { display:grid; justify-items:end; gap:5px; }
.work-queue-status small { color:var(--muted); }
.message-feed-item { display:grid; gap:5px; padding:12px; border:1px solid var(--border); border-radius:14px; background:#f9fbff; }
.message-feed-item span { color:#344054; line-height:1.45; }
.message-feed-item small { color:var(--muted); }
.sidebar-logout { width:100%; border:0; background:transparent; cursor:pointer; }
.auth-role-pills { display:flex; gap:9px; flex-wrap:wrap; margin-top:22px; position:relative; z-index:1; }
.auth-role-pills span { padding:7px 11px; border-radius:999px; background:rgba(255,255,255,.11); color:#eef2ff; font-size:.8rem; font-weight:800; }
.tracking-code-input { text-transform:uppercase; letter-spacing:2px; }
.full-width-button { width:100%; margin-top:8px; }
.client-title-row { margin-top:16px; }
.client-delivery-notice { margin-top:18px; }
.client-grid { align-items:start; }
.estimate-title-row { margin-bottom:8px; }
.estimate-actions { margin-top:15px; }
.client-message-form { margin-top:14px; }

@media (max-width:1100px) {
  .admin-stats-grid,.worker-stats-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .admin-dashboard-grid,.worker-dashboard-grid { grid-template-columns:1fr; }
}
@media (max-width:620px) {
  .portal-banner { padding:20px; align-items:flex-start; }
  .portal-banner-icon { width:55px; height:55px; border-radius:16px; }
  .admin-stats-grid,.worker-stats-grid { grid-template-columns:1fr; }
  .work-queue-item { grid-template-columns:5px 1fr; }
  .work-queue-status { grid-column:2; justify-items:start; }
  .audit-feed-item { grid-template-columns:auto 1fr; }
  .audit-feed-item time { grid-column:2; }
}
/* ===== FIN PORTALES GENERADOS ===== */
''')

CSS_START = "/* ===== PORTALES CLIENTE / TRABAJADOR / ADMINISTRADOR — GENERADO AUTOMÁTICAMENTE ===== */"
CSS_END = "/* ===== FIN PORTALES GENERADOS ===== */"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Genera los portales, compila y opcionalmente sube el proyecto.")
    parser.add_argument("--project", type=Path, help="Ruta de la raíz del proyecto.")
    parser.add_argument("--skip-install", action="store_true", help="No ejecutar npm ci/install.")
    parser.add_argument("--skip-checks", action="store_true", help="No ejecutar lint, typecheck, pruebas ni build.")
    parser.add_argument("--push", action="store_true", help="Intentar commit y push sin preguntar.")
    parser.add_argument("--no-push", action="store_true", help="No intentar subir a GitHub.")
    parser.add_argument("--seed", action="store_true", help="Ejecutar seed demo; requiere base local disponible.")
    parser.add_argument("--migrate", action="store_true", help="Ejecutar migraciones locales; requiere base disponible.")
    return parser.parse_args()


def find_project(explicit: Path | None) -> Path:
    candidates: list[Path] = []
    if explicit:
        candidates.append(explicit.expanduser())
    cwd = Path.cwd()
    candidates.extend([
        cwd,
        cwd / "punto-de-venta-celulares",
        cwd / "PUNTO-DE-VENTA-CELULARES" / "punto-de-venta-celulares",
        Path.home() / "Documents" / "CELULARES" / "PUNTO-DE-VENTA-CELULARES-CORREGIDO" / "punto-de-venta-celulares",
        Path.home() / "Documents" / "CELULARES" / "PUNTO-DE-VENTA-CELULARES" / "punto-de-venta-celulares",
    ])

    for candidate in candidates:
        candidate = candidate.resolve()
        if (candidate / "package.json").is_file() and (candidate / "prisma" / "schema.prisma").is_file():
            return candidate

    if sys.stdin.isatty():
        print("\nNo encontré automáticamente la carpeta del proyecto.")
        entered = input("Pega la ruta de la carpeta que contiene package.json: ").strip().strip('"')
        if entered:
            candidate = Path(entered).expanduser().resolve()
            if (candidate / "package.json").is_file() and (candidate / "prisma" / "schema.prisma").is_file():
                return candidate

    raise GeneratorError("No se encontró una raíz válida: debe contener package.json y prisma/schema.prisma.")


class Logger:
    def __init__(self, path: Path):
        self.path = path
        self.path.write_text(
            f"{APP_NAME} - GENERADOR DE PORTALES\nInicio: {datetime.now().isoformat()}\n\n",
            encoding="utf-8",
        )

    def write(self, message: str = "") -> None:
        print(message, flush=True)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(message + "\n")


def command_name(base: str) -> str:
    if os.name == "nt" and base in {"npm", "npx"}:
        return f"{base}.cmd"
    return base


def run_command(
    command: Sequence[str],
    *,
    cwd: Path,
    logger: Logger,
    env: dict[str, str] | None = None,
    check: bool = True,
    capture: bool = False,
) -> subprocess.CompletedProcess[str]:
    rendered = " ".join(command)
    logger.write(f"\n[CMD] {rendered}")
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)

    process = subprocess.run(
        list(command),
        cwd=str(cwd),
        env=merged_env,
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.STDOUT if capture else None,
    )
    if capture and process.stdout:
        logger.write(process.stdout.rstrip())
    if check and process.returncode != 0:
        raise GeneratorError(f"Falló el comando ({process.returncode}): {rendered}")
    return process


def ensure_tool(tool: str, logger: Logger) -> str:
    executable = command_name(tool)
    found = shutil.which(executable) or shutil.which(tool)
    if not found:
        raise GeneratorError(f"No se encontró {tool}. Instálalo y vuelve a ejecutar el generador.")
    logger.write(f"[OK] {tool}: {found}")
    return executable


def make_backup(project: Path, paths: Iterable[str], logger: Logger) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = project.parent / f"RESPALDO_PORTALES_{timestamp}.zip"
    copied = 0
    with zipfile.ZipFile(backup, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for relative in paths:
            source = project / relative
            if source.exists() and source.is_file():
                archive.write(source, arcname=relative)
                copied += 1
    if copied:
        logger.write(f"[OK] Respaldo ZIP creado: {backup} ({copied} archivos)")
    else:
        backup.unlink(missing_ok=True)
        logger.write("[INFO] No había archivos previos que respaldar.")
    return backup


def write_text(path: Path, content: str, logger: Logger) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    normalized = content.replace("\r\n", "\n")
    current = path.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n") if path.exists() else None
    if current == normalized:
        logger.write(f"[SIN CAMBIO] {path.relative_to(path.parents[len(path.parts) - 1]) if False else path.name}")
        return
    path.write_text(normalized, encoding="utf-8", newline="\n")
    logger.write(f"[GENERADO] {path}")


def update_css(project: Path, logger: Logger) -> None:
    path = project / "app" / "globals.css"
    if not path.exists():
        raise GeneratorError("No existe app/globals.css.")
    content = path.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")
    if CSS_START in content and CSS_END in content:
        before = content.split(CSS_START, 1)[0].rstrip()
        after = content.split(CSS_END, 1)[1].lstrip("\n")
        result = f"{before}\n\n{CSS_BLOCK}\n{after}".rstrip() + "\n"
    else:
        result = content.rstrip() + "\n\n" + CSS_BLOCK + "\n"
    path.write_text(result, encoding="utf-8", newline="\n")
    logger.write(f"[ACTUALIZADO] {path}")


def update_package_json(project: Path, logger: Logger) -> None:
    path = project / "package.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    scripts = data.setdefault("scripts", {})
    scripts.update({
        "dev": "next dev",
        "build": "npm run db:generate && next build",
        "start": "next start",
        "start:railway": "node scripts/start-railway.mjs",
        "lint": "eslint .",
        "typecheck": "tsc --noEmit",
        "test": "vitest run",
        "db:generate": "prisma generate",
        "db:migrate": "prisma migrate dev",
        "db:deploy": "prisma migrate deploy",
        "db:seed": "prisma db seed",
        "verify": "npm run lint && npm run typecheck && npm run test && npm run build",
    })
    data["name"] = "punto-de-venta-celulares"
    data["private"] = True
    data.setdefault("engines", {})["node"] = ">=22.12.0 <25"
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    logger.write(f"[ACTUALIZADO] {path}")


def append_gitignore(project: Path, logger: Logger) -> None:
    path = project / ".gitignore"
    content = path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""
    required = [
        ".env",
        ".env.local",
        ".env.production.local",
        "RAILWAY_VARIABLES_PRIVADAS.txt",
        "GENERADOR_PORTALES_LOG.txt",
        "_backup_portales_*/",
        "node_modules/",
        ".next/",
    ]
    lines = content.replace("\r\n", "\n").splitlines()
    existing = {line.strip() for line in lines}
    changed = False
    for item in required:
        if item not in existing:
            lines.append(item)
            changed = True
    if changed or not path.exists():
        path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8", newline="\n")
        logger.write(f"[ACTUALIZADO] {path}")


def ensure_private_env(project: Path, logger: Logger) -> dict[str, str]:
    local_env = project / ".env.local"
    variables_file = project / "RAILWAY_VARIABLES_PRIVADAS.txt"

    session_secret = secrets.token_urlsafe(64)
    access_secret = secrets.token_urlsafe(64)

    if local_env.exists():
        logger.write("[INFO] .env.local ya existe; no se sobrescribió.")
    else:
        local_env.write_text(dedent(f'''
            DATABASE_URL="postgresql://postgres:postgres@localhost:5432/punto_venta_celulares?schema=public"
            SESSION_SECRET="{session_secret}"
            ACCESS_CODE_SECRET="{access_secret}"
            NEXT_PUBLIC_APP_NAME="{APP_NAME}"
            NEXT_PUBLIC_COMPANY_NAME="{COMPANY_NAME}"
            NODE_ENV="development"
            ALLOW_DEMO_SEED="true"
        '''), encoding="utf-8", newline="\n")
        logger.write(f"[PRIVADO] Se creó {local_env}; está excluido de Git.")

    if variables_file.exists():
        logger.write("[INFO] RAILWAY_VARIABLES_PRIVADAS.txt ya existe; no se sobrescribió.")
    else:
        variables_file.write_text(dedent(f'''
            COPIA ESTAS VARIABLES EN EL SERVICIO DE LA APLICACIÓN EN RAILWAY
            NO SUBAS ESTE ARCHIVO A GITHUB

            DATABASE_URL=${{{{Postgres.DATABASE_URL}}}}
            SESSION_SECRET={session_secret}
            ACCESS_CODE_SECRET={access_secret}
            NEXT_PUBLIC_APP_NAME={APP_NAME}
            NEXT_PUBLIC_COMPANY_NAME={COMPANY_NAME}
            NODE_ENV=production
            ALLOW_DEMO_SEED=false
        '''), encoding="utf-8", newline="\n")
        logger.write(f"[PRIVADO] Se creó {variables_file}; está excluido de Git.")

    return {
        "DATABASE_URL": "postgresql://postgres:postgres@127.0.0.1:5432/punto_venta_celulares?schema=public",
        "SESSION_SECRET": session_secret,
        "ACCESS_CODE_SECRET": access_secret,
        "NEXT_PUBLIC_APP_NAME": APP_NAME,
        "NEXT_PUBLIC_COMPANY_NAME": COMPANY_NAME,
        "ALLOW_DEMO_SEED": "true",
        # Prisma 7 puede usar su motor WASM para `generate`; esta ruta evita
        # una descarga innecesaria del schema-engine durante la compilación local.
        # No se utiliza para migraciones ni durante la ejecución en Railway.
        "PRISMA_SCHEMA_ENGINE_BINARY": str(Path("/bin/true") if Path("/bin/true").exists() else Path(sys.executable).resolve()),
    }


def fix_known_type_issues(project: Path, logger: Logger) -> None:
    path = project / "app" / "actions" / "repair-details.ts"
    if not path.exists():
        return
    content = path.read_text(encoding="utf-8", errors="replace")
    old = "[RepairStatus.REPAIRING, RepairStatus.TESTING, RepairStatus.COMPLETED].includes(newStatus)"
    new = "([RepairStatus.REPAIRING, RepairStatus.TESTING, RepairStatus.COMPLETED] as RepairStatus[]).includes(newStatus)"
    if old in content:
        path.write_text(content.replace(old, new), encoding="utf-8", newline="\n")
        logger.write(f"[CORREGIDO] {path}")


def generate_files(project: Path, logger: Logger) -> None:
    paths = list(FILES.keys()) + ["app/globals.css", "package.json", ".gitignore"]
    make_backup(project, paths, logger)
    for relative, content in FILES.items():
        write_text(project / relative, content, logger)
    update_css(project, logger)
    update_package_json(project, logger)
    append_gitignore(project, logger)
    fix_known_type_issues(project, logger)


def compile_project(project: Path, logger: Logger, args: argparse.Namespace, build_env: dict[str, str]) -> None:
    npm = ensure_tool("npm", logger)
    ensure_tool("node", logger)

    if not args.skip_install:
        install_command = [npm, "ci"] if (project / "package-lock.json").exists() else [npm, "install"]
        run_command(install_command, cwd=project, logger=logger, env=build_env)
    else:
        logger.write("[OMITIDO] Instalación de dependencias.")

    if args.skip_checks:
        logger.write("[OMITIDO] Lint, typecheck, pruebas y build.")
        return

    commands = [
        [npm, "run", "db:generate"],
        [npm, "run", "lint"],
        [npm, "run", "typecheck"],
        [npm, "run", "test"],
        [npm, "run", "build"],
    ]
    for command in commands:
        run_command(command, cwd=project, logger=logger, env=build_env)

    if args.migrate:
        run_command([npm, "run", "db:deploy"], cwd=project, logger=logger)
    if args.seed:
        run_command([npm, "run", "db:seed"], cwd=project, logger=logger)


def git_output(project: Path, logger: Logger, *args: str, check: bool = False) -> subprocess.CompletedProcess[str]:
    return run_command(["git", *args], cwd=project, logger=logger, check=check, capture=True)


def ensure_git_repository(project: Path, logger: Logger) -> None:
    ensure_tool("git", logger)
    if not (project / ".git").exists():
        git_output(project, logger, "init", check=True)
    git_output(project, logger, "branch", "-M", "main", check=True)

    remote = git_output(project, logger, "remote", "get-url", "origin", check=False)
    if remote.returncode != 0:
        git_output(project, logger, "remote", "add", "origin", REMOTE_URL, check=True)
        logger.write(f"[OK] Se agregó origin: {REMOTE_URL}")
    elif REMOTE_URL not in (remote.stdout or ""):
        git_output(project, logger, "remote", "set-url", "origin", REMOTE_URL, check=True)
        logger.write(f"[OK] Se actualizó origin: {REMOTE_URL}")


def commit_changes(project: Path, logger: Logger) -> bool:
    git_output(project, logger, "add", "-A", check=True)
    status = git_output(project, logger, "status", "--porcelain", check=True)
    if not (status.stdout or "").strip():
        logger.write("[INFO] No hay cambios nuevos para crear un commit.")
        return False

    email = git_output(project, logger, "config", "user.email", check=False)
    name = git_output(project, logger, "config", "user.name", check=False)
    if email.returncode != 0 or not (email.stdout or "").strip():
        git_output(project, logger, "config", "user.email", "emannnuel55@gmail.com", check=True)
    if name.returncode != 0 or not (name.stdout or "").strip():
        git_output(project, logger, "config", "user.name", "Emanuel Rivera", check=True)

    git_output(project, logger, "commit", "-m", "feat: portales cliente trabajadores y administrador", check=True)
    return True


def push_with_recovery(project: Path, logger: Logger) -> None:
    push = git_output(project, logger, "push", "-u", "origin", "main", check=False)
    if push.returncode == 0:
        logger.write("[OK] Cambios subidos a GitHub. Railway podrá iniciar un nuevo despliegue.")
        return

    output = push.stdout or ""
    if "non-fast-forward" not in output and "fetch first" not in output and "rejected" not in output:
        raise GeneratorError("Git no pudo subir los cambios. Revisa el log; puede existir un bloqueo de red o autenticación.")

    logger.write("\n[AVISO] El repositorio remoto tiene un historial distinto, probablemente porque se cargó manualmente.")
    if not sys.stdin.isatty():
        raise GeneratorError("Push rechazado por historial remoto diferente. Ejecuta otra vez en modo interactivo.")

    confirmation = input("Escribe SINCRONIZAR para conservar tus archivos y basar el nuevo commit en GitHub: ").strip().upper()
    if confirmation != "SINCRONIZAR":
        raise GeneratorError("Sincronización cancelada por el usuario.")

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_branch = f"respaldo-local-{timestamp}"
    git_output(project, logger, "branch", backup_branch, check=False)
    git_output(project, logger, "fetch", "origin", "main", check=True)
    git_output(project, logger, "reset", "--mixed", "origin/main", check=True)
    git_output(project, logger, "add", "-A", check=True)
    status = git_output(project, logger, "status", "--porcelain", check=True)
    if (status.stdout or "").strip():
        git_output(project, logger, "commit", "-m", "feat: portales cliente trabajadores y administrador", check=True)
    git_output(project, logger, "push", "-u", "origin", "main", check=True)
    logger.write(f"[OK] Sincronización completada. Respaldo del historial anterior: {backup_branch}")


def ask_push(args: argparse.Namespace) -> bool:
    if args.no_push:
        return False
    if args.push:
        return True
    if not sys.stdin.isatty():
        return False
    answer = input("\n¿Deseas crear commit y subir los cambios a GitHub ahora? [S/n]: ").strip().lower()
    return answer not in {"n", "no"}


def print_header() -> None:
    print("=" * 70)
    print(" PUNTO DE VENTA CELULARES - GENERADOR DE PORTALES Y COMPILACIÓN")
    print("=" * 70)


def main() -> int:
    print_header()
    args = parse_args()
    try:
        project = find_project(args.project)
        logger = Logger(project / LOG_NAME)
        logger.write(f"Proyecto: {project}")
        logger.write(f"GitHub:   {REMOTE_URL}")
        logger.write("\n[1/5] Generando portales y configuraciones...")
        generate_files(project, logger)

        logger.write("\n[2/5] Generando variables privadas locales y de Railway...")
        build_env = ensure_private_env(project, logger)

        logger.write("\n[3/5] Instalando, validando y compilando...")
        compile_project(project, logger, args, build_env)
        logger.write("[OK] Compilación y validaciones terminadas correctamente.")

        logger.write("\n[4/5] Preparando Git...")
        if ask_push(args):
            ensure_git_repository(project, logger)
            commit_changes(project, logger)
            push_with_recovery(project, logger)
        else:
            logger.write("[OMITIDO] Subida a GitHub. Los archivos quedaron listos localmente.")

        logger.write("\n[5/5] Proceso finalizado.")
        logger.write("Portales disponibles:")
        logger.write("  Cliente:       /seguimiento y /cliente")
        logger.write("  Trabajadores:  /trabajadores y /panel/trabajador")
        logger.write("  Administrador: /administrador y /panel/administrador")
        logger.write(f"Log completo: {logger.path}")
        logger.write("Variables Railway: RAILWAY_VARIABLES_PRIVADAS.txt (NO subir a GitHub)")
        print("\nTODO TERMINÓ CORRECTAMENTE.")
        if os.name == "nt" and sys.stdin.isatty():
            input("Presiona ENTER para cerrar...")
        return 0
    except KeyboardInterrupt:
        print("\nProceso cancelado.")
        return 130
    except Exception as exc:
        print("\n" + "=" * 70)
        print(f"ERROR: {exc}")
        print("=" * 70)
        print(f"Revisa {LOG_NAME} dentro de la carpeta del proyecto.")
        if os.name == "nt" and sys.stdin.isatty():
            input("Presiona ENTER para cerrar...")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
