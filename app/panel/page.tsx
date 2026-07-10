import Link from "next/link";
import { DollarSign, Wrench, Users, PackageX } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { repairStatusLabels } from "@/lib/repair-state";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date(); today.setHours(0,0,0,0);
  const [salesAggregate, openRepairs, customers, latestRepairs, latestSales] = await Promise.all([
    db.sale.aggregate({ where: { createdAt: { gte: today } }, _sum: { total: true } }),
    db.repairOrder.count({ where: { status: { notIn: ["DELIVERED","CANCELLED"] } } }),
    db.customer.count({ where: { active: true } }),
    db.repairOrder.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { customer: true, device: true, technician: true } }),
    db.sale.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { user: true } })
  ]);
  const lowProducts = await db.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint as count FROM "Product" WHERE active = true AND stock <= "minimumStock"`;
  const lowCount = Number(lowProducts[0]?.count || 0);
  return <>
    <div className="page-header"><div><h2>Panel ejecutivo</h2><p>Resumen operativo actualizado desde la base de datos.</p></div><div className="inline-actions"><Link href="/panel/reparaciones/nueva" className="btn btn-primary">Nueva reparación</Link><Link href="/panel/pos" className="btn btn-secondary">Abrir POS</Link></div></div>
    <section className="stats-grid"><StatCard label="Ventas de hoy" value={formatMoney(salesAggregate._sum.total?.toString() || 0)} icon={<DollarSign size={20}/>}/><StatCard label="Reparaciones activas" value={openRepairs} icon={<Wrench size={20}/>}/><StatCard label="Clientes activos" value={customers} icon={<Users size={20}/>}/><StatCard label="Productos bajos" value={lowCount} icon={<PackageX size={20}/>} /></section>
    <section className="grid-two"><div className="card"><h3>Reparaciones recientes</h3><div className="table-wrap"><table><thead><tr><th>Folio</th><th>Cliente</th><th>Equipo</th><th>Estado</th><th>Técnico</th></tr></thead><tbody>{latestRepairs.map((r) => <tr key={r.id}><td><Link href={`/panel/reparaciones/${r.id}`}><strong>{r.publicFolio}</strong></Link></td><td>{r.customer.firstName} {r.customer.lastName}</td><td>{r.device.brand} {r.device.model}</td><td><span className="badge">{repairStatusLabels[r.status]}</span></td><td>{r.technician?.name || "Sin asignar"}</td></tr>)}</tbody></table></div></div>
    <div className="card"><h3>Últimas ventas</h3>{latestSales.length ? <div className="info-list">{latestSales.map((s) => <div className="info-row" key={s.id}><span>{s.folio}<br/><small>{s.user.name}</small></span><strong>{formatMoney(s.total.toString())}</strong></div>)}</div> : <div className="empty">Todavía no hay ventas.</div>}</div></section>
  </>;
}
