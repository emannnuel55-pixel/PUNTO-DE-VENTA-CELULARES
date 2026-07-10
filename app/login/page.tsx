import { AppLogo } from "@/components/AppLogo";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="auth-page">
    <section className="auth-brand"><AppLogo/><h1>Control total de tu tienda y taller.</h1><p>Ventas, inventario, clientes, reparaciones y seguimiento privado en una sola plataforma diseñada por LINOEM DEVELOPMENT.</p></section>
    <section className="auth-form-wrap"><div className="auth-card"><h2>Acceso de empleados</h2><p>Ingresa con tu usuario autorizado.</p>{params.error && <div className="alert alert-error">Correo o contraseña incorrectos.</div>}<form action="/api/auth/login" method="post" className="form-grid one"><div className="field"><label>Correo</label><input name="email" type="email" autoComplete="username" required placeholder="admin@linoem.mx"/></div><div className="field"><label>Contraseña</label><input name="password" type="password" autoComplete="current-password" required minLength={8}/></div><button className="btn btn-primary" type="submit">Entrar al panel</button></form><div className="alert alert-info" style={{marginTop:18}}>Demo: admin@linoem.mx / LinoemDemo2026!</div></div></section>
  </main>;
}
