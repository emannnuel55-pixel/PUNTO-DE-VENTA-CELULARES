import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { allowedTransitions, repairStatusLabels } from "@/lib/repair-state";
import { addRepairUpdate, createEstimate, sendStaffMessage, reassignTechnician } from "@/app/actions/repair-details";
import { regenerateClientAccess, revokeClientAccess, updateRepair, deleteRepair } from "@/app/actions/repairs";
import { IssuedCode } from "@/components/IssuedCode";
import { Role } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function RepairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, technicians] = await Promise.all([
    db.repairOrder.findUnique({ where: { id }, include: { customer: true, device: true, branch: true, receivedBy: true, technician: true, updates: { orderBy: { sequence: "desc" }, include: { user: true } }, messages: { orderBy: { createdAt: "asc" }, include: { senderUser: true } }, estimates: { orderBy: { version: "desc" } }, photos: true } }),
    db.user.findMany({ where: { active: true, role: { in: [Role.TECHNICIAN, Role.ADMIN, Role.OWNER, Role.MANAGER] } }, orderBy: { name: "asc" } })
  ]);
  if (!order) notFound();
  const transitions = allowedTransitions[order.status];
  return <>
    <div className="page-header"><div><h2>{order.publicFolio}</h2><p>{order.customer.firstName} {order.customer.lastName} · {order.device.brand} {order.device.model}</p></div><span className="badge">{repairStatusLabels[order.status]}</span></div>
    <IssuedCode orderId={order.id}/>
    <div className="split-card" style={{marginTop:20}}><section className="card"><h3>Información de la orden</h3><div className="info-list"><div className="info-row"><span>Cliente</span><strong>{order.customer.firstName} {order.customer.lastName}</strong></div><div className="info-row"><span>Teléfono</span><strong>{order.customer.phone}</strong></div><div className="info-row"><span>Equipo</span><strong>{order.device.brand} {order.device.model}</strong></div><div className="info-row"><span>IMEI / Serie</span><strong>{order.device.imei || order.device.serialNumber || "No registrado"}</strong></div><div className="info-row"><span>Técnico</span><strong>{order.technician?.name || "Sin asignar"}</strong></div><div className="info-row"><span>Presupuesto</span><strong>{formatMoney(order.total.toString())}</strong></div><div className="info-row"><span>Anticipo</span><strong>{formatMoney(order.deposit.toString())}</strong></div><div className="info-row"><span>Código de seguimiento (Cliente)</span><strong>{order.accessCodePlain || `••••-${order.accessCodeLast4}`} {order.accessCodeRevokedAt ? "(revocado)" : ""}</strong></div></div><div className="inline-actions" style={{marginTop:16, display: "flex", flexDirection: "column", gap: "10px"}}><div style={{display: "flex", gap: "8px", width: "100%"}}><form action={regenerateClientAccess.bind(null,order.id)} style={{flex: 1}}><button className="btn btn-secondary btn-small" style={{width: "100%"}}>Regenerar código</button></form><form action={revokeClientAccess.bind(null,order.id)} style={{flex: 1}}><button className="btn btn-danger btn-small" style={{width: "100%"}}>Revocar acceso</button></form></div><details style={{ width: "100%" }}><summary className="btn btn-small btn-secondary" style={{width: "100%", display: "block", textAlign: "center"}}>Editar orden</summary><form action={updateRepair.bind(null, order.id)} className="form-grid one" style={{ marginTop: "12px", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px" }}><div className="field"><label>Marca del dispositivo</label><input name="brand" defaultValue={order.device.brand} required /></div><div className="field"><label>Modelo</label><input name="model" defaultValue={order.device.model} required /></div><div className="field"><label>Color</label><input name="color" defaultValue={order.device.color || ""} /></div><div className="field"><label>Número de Serie</label><input name="serialNumber" defaultValue={order.device.serialNumber || ""} /></div><div className="field"><label>IMEI</label><input name="imei" defaultValue={order.device.imei || ""} /></div><div className="field"><label>Problema reportado</label><textarea name="issue" defaultValue={order.issue} required /></div><div className="field"><label>Condición física</label><textarea name="physicalCondition" defaultValue={order.physicalCondition || ""} /></div><div className="field"><label>Accesorios</label><textarea name="accessories" defaultValue={order.accessories || ""} /></div><div className="field"><label>Diagnóstico</label><textarea name="diagnosis" defaultValue={order.diagnosis || ""} /></div><div className="field"><label>Presupuesto ($)</label><input name="initialEstimate" type="number" min="0" step="0.01" defaultValue={order.initialEstimate.toString()} required /></div><div className="field"><label>Anticipo ($)</label><input name="deposit" type="number" min="0" step="0.01" defaultValue={order.deposit.toString()} required /></div><div className="field"><label>Fecha Prometida</label><input name="promisedAt" type="datetime-local" defaultValue={order.promisedAt ? new Date(order.promisedAt.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} /></div><button className="btn btn-primary" type="submit" style={{width: "100%"}}>Guardar cambios</button></form></details><form action={deleteRepair.bind(null, order.id)} method="post" style={{ width: "100%" }}><button className="btn btn-danger btn-small" style={{ width: "100%" }} type="submit">Eliminar orden</button></form></div></section>
    <section className="card"><h3>Problema y diagnóstico</h3><p><strong>Problema reportado</strong><br/>{order.issue}</p><p><strong>Condición física</strong><br/>{order.physicalCondition || "Sin observaciones"}</p><p><strong>Accesorios</strong><br/>{order.accessories || "Ninguno"}</p><p><strong>Diagnóstico</strong><br/>{order.diagnosis || "Pendiente"}</p>
    {order.photos && order.photos.length > 0 && (
      <div style={{ marginTop: 16 }}>
        <strong>Evidencia fotográfica (recepción)</strong>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
          {order.photos.map((photo) => (
            <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", overflow: "hidden", width: "100px", height: "100px" }}>
              <img src={photo.url} alt="Evidencia física" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </a>
          ))}
        </div>
      </div>
    )}
    </section></div>
    <div className="grid-two" style={{marginTop:20}}>
      <div>
        <section className="card"><h3>Registrar avance</h3><form action={addRepairUpdate.bind(null,order.id)} className="form-grid one"><div className="field"><label>Nuevo estado</label><select name="status" defaultValue={order.status}><option value={order.status}>{repairStatusLabels[order.status]} (sin cambio)</option>{transitions.map((s)=><option value={s} key={s}>{repairStatusLabels[s]}</option>)}</select></div><div className="field"><label>Comentario visible para cliente</label><textarea name="comment" required/></div><div className="field"><label>Diagnóstico actualizado</label><textarea name="diagnosis" defaultValue={order.diagnosis || ""}/></div><button className="btn btn-primary">Guardar avance</button></form></section>
        <section className="card" style={{marginTop:20}}>
          <h3>Traspaso de reparación (Reasignar técnico)</h3>
          <form action={reassignTechnician.bind(null,order.id)} className="form-grid one">
            <div className="field">
              <label>Siguiente técnico</label>
              <select name="newTechnicianId" required defaultValue={order.technicianId || ""}>
                <option value="" disabled>Selecciona un técnico</option>
                {technicians.map((t)=><option value={t.id} key={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Informe / Notas de traspaso para el técnico</label>
              <textarea name="handoverNotes" required placeholder="Describe qué pruebas realizaste y qué debe continuar haciendo el siguiente técnico..." />
            </div>
            <button className="btn btn-secondary">Asignar y notificar traspaso</button>
          </form>
        </section>
      </div>
      <section className="card"><h3>Línea de tiempo</h3><div className="timeline">{order.updates.map((u)=><div className="timeline-item" key={u.id}><strong>{repairStatusLabels[u.newStatus]}</strong><span>{u.comment}</span><small>{u.user.name} · {u.createdAt.toLocaleString("es-MX")}</small></div>)}</div></section>
    </div>
    <div className="grid-two" style={{marginTop:20}}><section className="card"><h3>Cotización adicional</h3><form action={createEstimate.bind(null,order.id)} className="form-grid"><div className="field full"><label>Título</label><input name="title" required placeholder="Cambio de centro de carga"/></div><div className="field full"><label>Motivo y evidencia técnica</label><textarea name="reason" required/></div><div className="field"><label>Refacciones</label><input name="partsAmount" type="number" min="0" step="0.01" defaultValue="0"/></div><div className="field"><label>Mano de obra</label><input name="laborAmount" type="number" min="0" step="0.01" defaultValue="0"/></div><div className="field"><label>Impuestos</label><input name="taxAmount" type="number" min="0" step="0.01" defaultValue="0"/></div><div className="form-actions field full"><button className="btn btn-primary">Enviar propuesta</button></div></form><div style={{marginTop:18}}>{order.estimates.map((e)=><div className={`estimate-card ${e.status === "PENDING" ? "pending" : ""}`} key={e.id}><strong>v{e.version} · {e.title}</strong><p>{e.reason}</p><div className="info-row"><span>Total</span><strong>{formatMoney(e.totalAmount.toString())}</strong></div><span className="badge">{e.status}</span></div>)}</div></section>
    <section className="card"><h3>Chat con el cliente</h3><div className="chat">{order.messages.map((m)=><div className={`chat-message ${m.senderType === "CUSTOMER" ? "customer" : m.senderType === "SYSTEM" ? "system" : ""}`} key={m.id}>{m.body}<small>{m.senderUser?.name || m.senderType} · {m.createdAt.toLocaleString("es-MX")}</small></div>)}</div><form action={sendStaffMessage.bind(null,order.id)} className="form-grid one" style={{marginTop:12}}><div className="field"><textarea name="body" placeholder="Escribe un mensaje para el cliente" required/></div><button className="btn btn-primary">Enviar mensaje</button></form></section></div>
  </>;
}
