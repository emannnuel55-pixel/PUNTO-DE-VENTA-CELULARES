import { saveSettings } from "@/app/actions/settings";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser([Role.OWNER, Role.ADMIN]);
  
  const settings = await db.systemSetting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Configuración del Sistema</h2>
          <p>Personaliza los datos públicos de tu negocio, ubicación y redes sociales.</p>
        </div>
      </div>

      <section className="card" style={{ padding: "24px" }}>
        <form action={saveSettings} className="form-grid" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* SECCIÓN 1: IDENTIDAD COMERCIAL */}
          <div>
            <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px", color: "#38bdf8", marginBottom: "16px" }}>
              Identidad Comercial
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="field">
                <label>Nombre de la Página / Título Web</label>
                <input name="business_name" defaultValue={map.business_name || "PUNTO DE VENTA CELULARES"} placeholder="Ej. Linoem Store" />
              </div>
              <div className="field">
                <label>Empresa Desarrolladora / Footer</label>
                <input name="company_name" defaultValue={map.company_name || "LINOEM DEVELOPMENT"} placeholder="Ej. Linoem Development" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CONTACTO DIRECTO */}
          <div>
            <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px", color: "#a855f7", marginBottom: "16px" }}>
              Canales de Contacto
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="field">
                <label>Teléfono de Atención</label>
                <input name="phone" defaultValue={map.phone || ""} placeholder="Ej. 6561234567" />
              </div>
              <div className="field">
                <label>WhatsApp (Solo Números con Lada)</label>
                <input name="whatsapp" defaultValue={map.whatsapp || ""} placeholder="Ej. 526561234567" />
              </div>
              <div className="field">
                <label>Correo Electrónico de Soporte</label>
                <input type="email" name="email" defaultValue={map.email || ""} placeholder="Ej. soporte@linoem.com" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: UBICACIÓN Y MAPAS */}
          <div>
            <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px", color: "#10b981", marginBottom: "16px" }}>
              Dirección y Geolocalización
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="field">
                <label>Dirección Física (Texto)</label>
                <input name="address" defaultValue={map.address || ""} placeholder="Calle 123, Colonia Centro, Ciudad Juárez" />
              </div>
              <div className="field">
                <label>Enlace de Google Maps (URL para abrir mapa externo)</label>
                <input name="google_maps_url" defaultValue={map.google_maps_url || ""} placeholder="https://maps.google.com/?q=..." />
              </div>
              <div className="field">
                <label>Código de Mapa Insertado (iframe src de Google Maps para vista en miniatura)</label>
                <textarea 
                  name="google_maps_embed" 
                  defaultValue={map.google_maps_embed || ""} 
                  placeholder='Copia el src del iframe o el código iframe completo. Ej: <iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                  style={{
                    width: "100%",
                    height: "80px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "10px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontFamily: "monospace"
                  }}
                />
              </div>
              <div className="field">
                <label>Horarios de Atención</label>
                <input name="hours" defaultValue={map.hours || ""} placeholder="Lunes a Viernes: 9:00 AM - 7:00 PM" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: REDES SOCIALES */}
          <div>
            <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px", color: "#f59e0b", marginBottom: "16px" }}>
              Redes Sociales (Enlaces Completos)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="field">
                <label>Facebook Link</label>
                <input name="facebook" defaultValue={map.facebook || ""} placeholder="https://facebook.com/pagina" />
              </div>
              <div className="field">
                <label>Instagram Link</label>
                <input name="instagram" defaultValue={map.instagram || ""} placeholder="https://instagram.com/usuario" />
              </div>
              <div className="field">
                <label>TikTok Link</label>
                <input name="tiktok" defaultValue={map.tiktok || ""} placeholder="https://tiktok.com/@usuario" />
              </div>
              <div className="field">
                <label>YouTube Link</label>
                <input name="youtube" defaultValue={map.youtube || ""} placeholder="https://youtube.com/@canal" />
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" style={{ padding: "12px 24px" }}>
              Guardar Configuración
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
