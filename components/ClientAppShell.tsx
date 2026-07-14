"use client";

import { useState } from "react";
import { AppLogo } from "./AppLogo";
import { Store, Search, HelpCircle, ArrowRight, ShieldCheck, MapPin, Phone, MessageSquare, Wrench } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: any;
  stock: number;
  imageUrl: string | null;
  brand: string | null;
  category: string | null;
}

export function ClientAppShell({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState<"tienda" | "rastrear" | "contacto">("tienda");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");

  // Get unique categories
  const categories = ["Todos", ...Array.from(new Set(products.map(p => p.category || p.brand || "Accesorios").filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    if (categoryFilter === "Todos") return true;
    return (p.category === categoryFilter || p.brand === categoryFilter);
  });

  return (
    <div className="app-container">
      {/* Fondo Interactivo Animado */}
      <div className="interactive-bg">
        <div className="glowing-blob blob-cyan"></div>
        <div className="glowing-blob blob-blue"></div>
        <div className="glowing-blob blob-purple"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Header Fijo Estilo App */}
      <header className="app-header">
        <div className="header-inner">
          <AppLogo />
          
          {/* Navegación Desktop */}
          <nav className="desktop-nav">
            <button 
              className={`nav-item ${activeTab === "tienda" ? "active" : ""}`}
              onClick={() => setActiveTab("tienda")}
            >
              Tienda
            </button>
            <button 
              className={`nav-item ${activeTab === "rastrear" ? "active" : ""}`}
              onClick={() => setActiveTab("rastrear")}
            >
              Rastrear Reparación
            </button>
            <button 
              className={`nav-item ${activeTab === "contacto" ? "active" : ""}`}
              onClick={() => setActiveTab("contacto")}
            >
              Contacto
            </button>
            <Link href="https://punto-de-venta-celulares-production.up.railway.app/login" className="nav-btn-admin">Acceso Empleados</Link>
          </nav>
        </div>
      </header>

      {/* Área de Contenido Desplazable */}
      <main className="app-content">
        {activeTab === "tienda" && (
          <section className="tab-view fade-in">
            {/* Banner Destacado Estilo App Store */}
            <div className="promo-banner">
              <div className="promo-text">
                <span className="promo-tag">LINOEM Premium</span>
                <h2>Calidad garantizada para tu dispositivo</h2>
                <p>Encuentra los accesorios más exclusivos con stock en tiempo real.</p>
              </div>
            </div>

            {/* Selector de Categorías Horizontal */}
            <div className="categories-scroll">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${categoryFilter === cat ? "active" : ""}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid de Productos Premium */}
            <div className="app-catalog-grid">
              {filteredProducts.length === 0 ? (
                <div className="empty-state-card">
                  <Store size={48} className="empty-icon" />
                  <h3>Próximamente más productos</h3>
                  <p>Estamos actualizando nuestro catálogo. ¡Vuelve pronto!</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const hasValidImage = p.imageUrl && (p.imageUrl.startsWith("http://") || p.imageUrl.startsWith("https://") || p.imageUrl.startsWith("/"));
                  return (
                    <article key={p.id} className="app-product-card">
                      <div className="product-image-container">
                        {hasValidImage ? (
                          <img src={p.imageUrl!} alt={p.name} />
                        ) : (
                          <div className="fallback-image">
                            <Store size={32} />
                            <span>Sin Foto</span>
                          </div>
                        )}
                      </div>
                      <div className="product-details">
                        <span className="product-tag">{p.brand || p.category || "General"}</span>
                        <h3>{p.name}</h3>
                        <p className="product-desc">{p.description}</p>
                        <div className="product-bottom-row">
                          <strong className="product-price">
                            ${Number(p.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </strong>
                          <span className={`stock-badge ${p.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                            {p.stock > 0 ? "Disponible" : "Agotado"}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {activeTab === "rastrear" && (
          <section className="tab-view center-view fade-in">
            {/* Widget de Rastreo Estilo iOS */}
            <div className="ios-widget">
              <div className="widget-header-icon">
                <Wrench size={32} />
              </div>
              <h2>Rastreador de Equipos</h2>
              <p>Monitorea el avance de tu celular en tiempo real desde el taller a tus manos.</p>
              
              <form action="/api/customer/access" method="post" className="ios-form">
                <div className="ios-input-group">
                  <label htmlFor="code">Ingresa tu PIN privado</label>
                  <input 
                    id="code"
                    name="code" 
                    autoComplete="one-time-code" 
                    required 
                    minLength={12} 
                    maxLength={20} 
                    placeholder="ABC-1234-XYZ12" 
                    className="ios-input" 
                  />
                </div>
                <button type="submit" className="ios-btn-submit">
                  Consultar Estado <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === "contacto" && (
          <section className="tab-view fade-in">
            {/* Tarjetas de Soporte/Ubicación Estilo iOS Cards */}
            <div className="support-cards-grid">
              <div className="ios-info-card">
                <ShieldCheck size={36} className="card-icon cyan" />
                <h3>Garantía LINOEM</h3>
                <p>Nuestras reparaciones usan refacciones de la más alta calidad y cuentan con garantía extendida por escrito.</p>
              </div>

              <div className="ios-info-card">
                <MapPin size={36} className="card-icon blue" />
                <h3>Nuestra Sucursal</h3>
                <p>Visítanos para una valoración inmediata de tu dispositivo en nuestra sucursal céntrica.</p>
              </div>

              <div className="ios-info-card">
                <Phone size={36} className="card-icon purple" />
                <h3>Contacto Rápido</h3>
                <p>¿Tienes dudas sobre una cotización o servicio? Escríbenos o llámanos directamente.</p>
                <div className="support-actions">
                  <a href="tel:+52" className="support-link-btn">Llamar Ahora</a>
                  <Link href="https://punto-de-venta-celulares-production.up.railway.app/login" className="support-link-btn outline">Acceso Personal</Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Barra de Navegación Inferior Estilo iOS App (Solo Mobile) */}
      <nav className="mobile-tab-bar">
        <button 
          className={`tab-btn ${activeTab === "tienda" ? "active" : ""}`}
          onClick={() => setActiveTab("tienda")}
        >
          <Store size={22} />
          <span>Tienda</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === "rastrear" ? "active" : ""}`}
          onClick={() => setActiveTab("rastrear")}
        >
          <Search size={22} />
          <span>Rastrear</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === "contacto" ? "active" : ""}`}
          onClick={() => setActiveTab("contacto")}
        >
          <HelpCircle size={22} />
          <span>Soporte</span>
        </button>
      </nav>
    </div>
  );
}
