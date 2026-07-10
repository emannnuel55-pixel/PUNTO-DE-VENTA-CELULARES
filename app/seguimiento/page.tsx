import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";

export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const showDemo = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_SEED === "true";

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <AppLogo />
        <h1>Consulta el avance de tu celular.</h1>
        <p>Ingresa el código privado entregado al recibir tu equipo. La sesión queda limitada exclusivamente a esa orden.</p>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-card">
          <h2>Seguimiento privado</h2>
          <p>Escribe el código completo de tu reparación.</p>
          {params.error && <div className="alert alert-error">Código inválido, vencido o revocado.</div>}
          <form action="/api/customer/access" method="post" className="form-grid one">
            <div className="field"><label>Código de acceso</label><input name="code" autoComplete="one-time-code" required minLength={12} maxLength={20} placeholder="ABC-1234-XYZ12" className="tracking-code-input" /></div>
            <button className="btn btn-primary" type="submit">Consultar mi reparación</button>
          </form>
          {showDemo && <div className="alert alert-info" style={{ marginTop: 18 }}>Desarrollo: LCR-7K9P-2M8Q</div>}
          <Link className="btn btn-ghost full-width-button" href="/">Volver al inicio</Link>
        </div>
      </section>
    </main>
  );
}
