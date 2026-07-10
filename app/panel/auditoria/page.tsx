import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { auditRoles } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export default async function AuditPage(){
  await requireUser(auditRoles);
  const logs=await db.auditLog.findMany({take:200,orderBy:{createdAt:"desc"},include:{actor:true}});
  return <><div className="page-header"><div><h2>Auditoría</h2><p>Registro de operaciones críticas del sistema.</p></div></div><section className="card"><div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Actor</th><th>Acción</th><th>Entidad</th><th>Resultado</th><th>IP</th></tr></thead><tbody>{logs.map((l)=><tr key={l.id}><td>{l.createdAt.toLocaleString("es-MX")}</td><td>{l.actor?.name||"Cliente/Sistema"}</td><td><strong>{l.action}</strong></td><td>{l.entityType}<br/><small>{l.entityId||"—"}</small></td><td><span className="badge success">{l.result}</span></td><td>{l.ipAddress||"—"}</td></tr>)}</tbody></table></div></section></>;
}
