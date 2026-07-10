import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { Wrench, ShoppingCart, PackageCheck, ShieldCheck, MessageSquareText, BarChart3, Smartphone, ArrowRight } from "lucide-react";

const features = [
  [Wrench,"Reparaciones controladas","Recepción, diagnóstico, cotización, autorización, pruebas, entrega y garantía."],
  [ShoppingCart,"Punto de venta","Ventas con inventario transaccional, pagos, tickets y control por sucursal."],
  [PackageCheck,"Inventario y kardex","Existencias, ajustes, mínimos y trazabilidad de refacciones y accesorios."],
  [MessageSquareText,"Cliente en tiempo real","Seguimiento privado, avances, chat y autorización de cargos adicionales."],
  [ShieldCheck,"Seguridad empresarial","Sesiones revocables, Argon2id, permisos de servidor y auditoría."],
  [BarChart3,"Indicadores reales","Ventas, reparaciones, inventario bajo y productividad desde PostgreSQL."],
  [Smartphone,"Diseño adaptable","Interfaz optimizada para celular, tableta y computadora."],
  [ArrowRight,"Preparado para Railway","Docker, migraciones, health check y scripts de despliegue."],
] as const;

export default function HomePage() {
  return <main className="public-shell">
    <header className="public-header">
      <AppLogo />
      <div className="header-actions"><Link className="btn btn-secondary" href="/seguimiento">Seguir reparación</Link><Link className="btn btn-primary" href="/login">Acceso empleados</Link></div>
    </header>
    <section className="hero">
      <div>
        <span className="eyebrow">PLATAFORMA EMPRESARIAL LINOEM</span>
        <h1>PUNTO DE VENTA <span>CELULARES</span></h1>
        <p>Administra ventas, inventario, clientes y reparaciones desde una sola plataforma. Tus clientes pueden revisar el avance de su equipo con un código privado, aceptar cotizaciones y comunicarse con el negocio.</p>
        <div className="hero-actions"><Link className="btn btn-primary" href="/login">Entrar al panel <ArrowRight size={18}/></Link><Link className="btn btn-secondary" href="/seguimiento">Consultar mi equipo</Link></div>
      </div>
      <div className="hero-card"><h3>Operación conectada de principio a fin</h3><div className="hero-metrics"><div className="metric-mini"><strong>POS</strong><span>Ventas e inventario</span></div><div className="metric-mini"><strong>CRM</strong><span>Clientes y seguimiento</span></div><div className="metric-mini"><strong>RT</strong><span>Avances automáticos</span></div><div className="metric-mini"><strong>SEC</strong><span>Permisos y auditoría</span></div></div></div>
    </section>
    <section className="section"><div className="section-heading"><h2>Todo lo necesario para operar una tienda de celulares</h2><p>Una base funcional, conectada a PostgreSQL y preparada para evolucionar a una solución empresarial más amplia.</p></div><div className="feature-grid">{features.map(([Icon,title,text]) => <article className="feature-card" key={title}><div className="feature-icon"><Icon size={23}/></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <footer className="public-footer">© 2026 LINOEM DEVELOPMENT · Innovación digital que impulsa tu futuro</footer>
  </main>;
}
