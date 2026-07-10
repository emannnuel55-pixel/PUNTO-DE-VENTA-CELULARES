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
