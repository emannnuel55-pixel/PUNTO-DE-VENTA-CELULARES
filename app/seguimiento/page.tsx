import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";

export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="auth-page">
    <section className="auth-brand"><AppLogo/><h1>Consulta el avance de tu celular.</h1><p>Utiliza el código privado entregado al recibir tu equipo. El sistema no muestra datos de ninguna otra reparación.</p></section>
    <section className="auth-form-wrap"><div className="auth-card"><h2>Seguimiento privado</h2><p>Escribe tu código completo.</p>{params.error && <div className="alert alert-error">Código inválido, vencido o revocado.</div>}<form action="/api/customer/access" method="post" className="form-grid one"><div className="field"><label>Código de acceso</label><input name="code" autoComplete="one-time-code" required minLength={12} maxLength={20} placeholder="ABC-1234-XYZ12" style={{textTransform:"uppercase",letterSpacing:2}}/></div><button className="btn btn-primary" type="submit">Consultar reparación</button></form><div className="alert alert-info" style={{marginTop:18}}>Código demo: LCR-7K9P-2M8Q</div><Link className="btn btn-ghost" style={{width:"100%",marginTop:8}} href="/">Volver al inicio</Link></div></section>
  </main>;
}
