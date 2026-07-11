import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { ArrowRight, Search, Phone, ShieldCheck, MapPin } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await db.product.findMany({
    where: { active: true },
    take: 12,
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="store-shell">
      {/* Navbar Minimalista */}
      <nav className="store-nav">
        <div className="nav-container">
          <AppLogo />
          <div className="nav-links">
            <Link href="#tienda">Tienda</Link>
            <Link href="#reparaciones">Reparaciones</Link>
            <Link href="/login" className="nav-admin">Acceso empleados</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section Premium */}
      <header className="store-hero">
        <div className="hero-content">
          <span className="hero-badge">Servicio Premium LINOEM</span>
          <h1>Expertos en <span>tecnología.</span><br />Obsesionados con la perfección.</h1>
          <p>Encuentra los mejores accesorios para tu dispositivo, o revisa el avance de tu reparación en tiempo real con seguridad absoluta.</p>
          
          <div className="repair-widget">
            <h3>¿Dejaste tu equipo a reparar?</h3>
            <p>Ingresa tu PIN privado de 12 a 20 caracteres.</p>
            <form action="/api/customer/access" method="post" className="widget-form">
              <input 
                name="code" 
                autoComplete="one-time-code" 
                required 
                minLength={12} 
                maxLength={20} 
                placeholder="Ej. ABC-1234-XYZ12" 
                className="widget-input" 
              />
              <button type="submit" className="widget-btn">Rastrear Equipo <ArrowRight size={18}/></button>
            </form>
          </div>
        </div>
        <div className="hero-image-wrap">
          {/* Aquí iría una imagen estilo iPhone flotando, usamos un placeholder elegante */}
          <div className="hero-abstract-device"></div>
        </div>
      </header>

      {/* Catálogo de Productos */}
      <section id="tienda" className="store-catalog">
        <div className="catalog-header">
          <h2>Catálogo Destacado.</h2>
          <p>Equipa tu celular con los mejores accesorios.</p>
        </div>
        <div className="catalog-grid">
          {products.length === 0 ? (
            <p className="empty-catalog">Próximamente agregaremos nuestros productos aquí.</p>
          ) : (
            products.map(p => (
              <article key={p.id} className="catalog-item">
                <div className="catalog-item-image">
                  {p.imageUrl ? (
                     <img src={p.imageUrl} alt={p.name} />
                  ) : (
                     <div className="catalog-no-image">Sin Foto</div>
                  )}
                </div>
                <div className="catalog-item-info">
                  <span className="catalog-brand">{p.brand || p.category}</span>
                  <h3>{p.name}</h3>
                  {p.description && <p className="catalog-desc">{p.description}</p>}
                  <div className="catalog-price-row">
                    <strong>${Number(p.price).toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>
                    <span className={p.stock > 0 ? "stock-ok" : "stock-out"}>
                      {p.stock > 0 ? "En existencia" : "Agotado"}
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Garantías */}
      <section className="store-guarantees">
        <div className="guarantee-box">
          <ShieldCheck size={32} />
          <h4>Garantía Extendida</h4>
          <p>Todas nuestras reparaciones cuentan con garantía por escrito.</p>
        </div>
        <div className="guarantee-box">
          <Search size={32} />
          <h4>Transparencia Total</h4>
          <p>El cliente siempre decide. Cotizaciones claras sin letras pequeñas.</p>
        </div>
        <div className="guarantee-box">
          <MapPin size={32} />
          <h4>Ubicación Céntrica</h4>
          <p>Visítanos en nuestra sucursal. Atención inmediata y personalizada.</p>
        </div>
      </section>

      <footer className="store-footer">
        © {new Date().getFullYear()} PUNTO DE VENTA CELULARES · LINOEM DEVELOPMENT
      </footer>
    </main>
  );
}
