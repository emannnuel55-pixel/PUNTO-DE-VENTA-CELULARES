import Link from "next/link";
import { createRepair } from "@/app/actions/repairs";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/auth";
import { repairWriteRoles } from "@/lib/permissions";
import { PhoneAutocomplete } from "@/components/PhoneAutocomplete";
import { CameraCapture } from "@/components/CameraCapture";

export const dynamic = "force-dynamic";

export default async function NewRepairPage() {
  await requireUser(repairWriteRoles);
  const [customers, technicians] = await Promise.all([
    db.customer.findMany({ where: { active: true }, orderBy: { firstName: "asc" } }),
    db.user.findMany({ where: { active: true, role: { in: [Role.TECHNICIAN,Role.ADMIN,Role.OWNER,Role.MANAGER] } }, orderBy: { name: "asc" } })
  ]);
  return <>
    <div className="page-header"><div><h2>Recepción de equipo</h2><p>Completa la información obligatoria para crear la orden y generar el código privado.</p></div><Link href="/panel/clientes" className="btn btn-secondary">Registrar cliente</Link></div>
    <section className="card"><form action={createRepair} className="form-grid"><div className="field full"><label>Cliente</label><select name="customerId" required defaultValue=""><option value="" disabled>Selecciona un cliente</option>{customers.map((c)=><option value={c.id} key={c.id}>{c.firstName} {c.lastName} · {c.phone}</option>)}</select></div><PhoneAutocomplete /><div className="field"><label>Color</label><input name="color"/></div><div className="field"><label>IMEI</label><input name="imei"/></div><div className="field"><label>Número de serie</label><input name="serialNumber"/></div><div className="field"><label>Técnico asignado</label><select name="technicianId" defaultValue=""><option value="">Sin asignar</option>{technicians.map((t)=><option value={t.id} key={t.id}>{t.name}</option>)}</select></div><div className="field full"><label>Problema reportado</label><textarea name="issue" required minLength={5}/></div><div className="field full"><label>Estado físico del equipo</label><textarea name="physicalCondition" placeholder="Pantalla, golpes, humedad, cámaras, botones..."/></div><div className="field full"><label>Accesorios entregados</label><textarea name="accessories" placeholder="Funda, cargador, SIM, memoria..."/></div><div className="field full"><CameraCapture name="photosJson" label="Fotografías del estado físico del equipo (Recepción)" /></div><div className="field"><label>Presupuesto inicial</label><input name="initialEstimate" type="number" min="0" step="0.01" defaultValue="0" required/></div><div className="field"><label>Anticipo</label><input name="deposit" type="number" min="0" step="0.01" defaultValue="0" required/></div><div className="field"><label>Fecha prometida</label><input name="promisedAt" type="datetime-local"/></div><div className="form-actions field full"><button className="btn btn-primary" type="submit">Crear orden y generar código</button></div></form></section>
  </>;
}
