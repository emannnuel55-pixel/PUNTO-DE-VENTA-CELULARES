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
          <div className="table-wrap desktop-only">
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

          <div className="mobile-only mobile-list-container">
            {latestRepairs.map((repair) => (
              <Link href={`/panel/reparaciones/${repair.id}`} key={repair.id} className="mobile-list-card">
                <div className="mobile-list-card-header">
                  <strong>{repair.publicFolio}</strong>
                  <span className="badge">{repairStatusLabels[repair.status]}</span>
                </div>
                <div className="mobile-list-card-body">
                  <p className="device-info">{repair.device.brand} {repair.device.model}</p>
                  <p className="customer-info">{repair.customer.firstName} {repair.customer.lastName}</p>
                </div>
              </Link>
            ))}
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
