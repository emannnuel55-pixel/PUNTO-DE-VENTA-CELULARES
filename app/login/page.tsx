import { AppLogo } from "@/components/AppLogo";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const showDemo = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_SEED === "true";

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <AppLogo />
        <h1>Control total de tu tienda y taller.</h1>
        <p>Acceso diferenciado para trabajadores, técnicos, ventas, almacén y administración.</p>
        <div className="auth-role-pills"><span>Administrador</span><span>Trabajadores</span><span>Cliente por código</span></div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-card">
          <h2>Acceso de empleados</h2>
          <p>El sistema abrirá automáticamente el portal correspondiente a tu rol.</p>
          {params.error && <div className="alert alert-error">Correo o contraseña incorrectos.</div>}
          <form action="/api/auth/login" method="post" className="form-grid one">
            <div className="field"><label>Correo</label><input name="email" type="email" autoComplete="username" required placeholder="usuario@empresa.com" /></div>
            <div className="field"><label>Contraseña</label><input name="password" type="password" autoComplete="current-password" required minLength={8} /></div>
            <button className="btn btn-primary" type="submit">Entrar a la plataforma</button>
          </form>
          {showDemo && <div className="alert alert-info" style={{ marginTop: 18 }}>Desarrollo: admin@linoem.mx / LinoemDemo2026!</div>}
        </div>
      </section>
    </main>
  );
}
