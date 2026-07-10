import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { repairStatusLabels } from "@/lib/repair-state";

export const dynamic = "force-dynamic";

export default async function RepairsPage() {
  const repairs = await db.repairOrder.findMany({ orderBy: { createdAt: "desc" }, include: { customer: true, device: true, technician: true } });
  return <>
    <div className="page-header"><div><h2>Reparaciones</h2><p>Seguimiento completo desde recepción hasta entrega.</p></div><Link href="/panel/reparaciones/nueva" className="btn btn-primary">Recibir equipo</Link></div>
    <section className="card"><div className="table-wrap"><table><thead><tr><th>Folio</th><th>Cliente</th><th>Equipo</th><th>Problema</th><th>Estado</th><th>Total</th><th>Técnico</th><th></th></tr></thead><tbody>{repairs.map((r) => <tr key={r.id}><td><strong>{r.publicFolio}</strong><br/><small>{r.createdAt.toLocaleString("es-MX")}</small></td><td>{r.customer.firstName} {r.customer.lastName}<br/><small>{r.customer.phone}</small></td><td>{r.device.brand} {r.device.model}<br/><small>{r.device.serialNumber || r.device.imei || "Sin serie"}</small></td><td style={{maxWidth:250}}>{r.issue}</td><td><span className="badge">{repairStatusLabels[r.status]}</span></td><td>{formatMoney(r.total.toString())}</td><td>{r.technician?.name || "Sin asignar"}</td><td><Link className="btn btn-small btn-secondary" href={`/panel/reparaciones/${r.id}`}>Abrir</Link></td></tr>)}</tbody></table></div></section>
  </>;
}
