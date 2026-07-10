import { saveSettings } from "@/app/actions/settings";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";

export const dynamic="force-dynamic";
export default async function SettingsPage(){
  await requireUser([Role.OWNER,Role.ADMIN]);
  const settings=await db.systemSetting.findMany();const map=Object.fromEntries(settings.map((s)=>[s.key,s.value]));
  return <><div className="page-header"><div><h2>Configuración</h2><p>Datos generales editables de la plataforma.</p></div></div><section className="card"><form action={saveSettings} className="form-grid"><div className="field"><label>Nombre comercial</label><input name="business_name" defaultValue={map.business_name||"PUNTO DE VENTA CELULARES"}/></div><div className="field"><label>Empresa desarrolladora</label><input name="company_name" defaultValue={map.company_name||"LINOEM DEVELOPMENT"}/></div><div className="field"><label>Teléfono</label><input name="phone" defaultValue={map.phone||""}/></div><div className="field"><label>WhatsApp</label><input name="whatsapp" defaultValue={map.whatsapp||""}/></div><div className="field full"><label>Dirección</label><input name="address" defaultValue={map.address||""}/></div><div className="field full"><label>Horarios</label><input name="hours" defaultValue={map.hours||""}/></div><div className="form-actions field full"><button className="btn btn-primary">Guardar configuración</button></div></form></section></>;
}
