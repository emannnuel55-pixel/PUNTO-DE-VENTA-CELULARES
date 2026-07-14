"use client";

import { useState, useRef } from "react";
import { AppLogo } from "./AppLogo";
import { Store, Search, HelpCircle, ArrowRight, ShieldCheck, MapPin, Phone, MessageSquare, Wrench, X, Cpu, Smartphone, Shield, Check, Eye, Boxes } from "lucide-react";
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  
  // Parallax 3D effect references
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<string>("");

  // Helper to format uploads URLs with the admin panel production domain
  const formatImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("/api/media/") || url.startsWith("/uploads/")) {
      const cleanPath = url.replace("/uploads/", "/api/media/");
      return `https://punto-de-venta-celulares-production.up.railway.app${cleanPath}`;
    }
    return url;
  };

  // Helper to parse JSON specifications and image list
  const parseProduct = (p: Product) => {
    let specs = {
      description: p.description || "",
      ram: "",
      rom: "",
      cpu: "",
      os: "",
      cameras: ""
    };
    
    if (p.description) {
      try {
        if (p.description.startsWith("{") && p.description.endsWith("}")) {
          specs = { ...specs, ...JSON.parse(p.description) };
        }
      } catch (e) {}
    }

    let images: string[] = [];
    if (p.imageUrl) {
      try {
        if (p.imageUrl.startsWith("[") && p.imageUrl.endsWith("]")) {
          images = JSON.parse(p.imageUrl);
        } else {
          images = [p.imageUrl];
        }
      } catch (e) {
        images = [p.imageUrl];
      }
    }
    
    return { specs, images };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = (yc - y) / 10;
    const angleY = (x - xc) / 10;
    setTiltStyle(`perspective(600px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTiltStyle("perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

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
                  const { images } = parseProduct(p);
                  const displayImage = images[0];
                  const hasValidImage = displayImage && (displayImage.startsWith("http://") || displayImage.startsWith("https://") || displayImage.startsWith("/"));
                  
                  return (
                    <article 
                      key={p.id} 
                      className="app-product-card clickable" 
                      onClick={() => {
                        setSelectedProduct(p);
                        setActiveImageIdx(0);
                      }}
                    >
                      <div className="product-image-container">
                        {hasValidImage ? (
                          <img src={formatImageUrl(displayImage)} alt={p.name} />
                        ) : (
                          <div className="fallback-image">
                            <Store size={32} />
                            <span>Sin Foto</span>
                          </div>
                        )}
                        <div className="hover-overlay-eye">
                          <Eye size={24} />
                          <span>Ver Ficha 3D</span>
                        </div>
                      </div>
                      <div className="product-details">
                        <span className="product-tag">{p.brand || p.category || "General"}</span>
                        <h3>{p.name}</h3>
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

      {/* DETALLES DE PRODUCTO INTERACTIVO / VISTA 3D / GALERÍA */}
      {selectedProduct && (() => {
        const { specs, images } = parseProduct(selectedProduct);
        const hasImages = images.length > 0;
        const currentImg = images[activeImageIdx] || "";
        const isSpecEmpty = !specs.ram && !specs.rom && !specs.cpu && !specs.os && !specs.cameras;

        return (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
                <X size={22} />
              </button>

              <div className="modal-layout">
                {/* 3D Parallax Image Viewer */}
                <div className="modal-viewer-column">
                  <div 
                    className="modal-image-wrapper-3d"
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ transform: tiltStyle }}
                  >
                    {hasImages ? (
                      <img src={formatImageUrl(currentImg)} alt={selectedProduct.name} className="modal-main-img" />
                    ) : (
                      <div className="fallback-image large">
                        <Store size={48} />
                        <span>Sin Foto</span>
                      </div>
                    )}
                  </div>

                  {/* Carousel Thumbnails */}
                  {images.length > 1 && (
                    <div className="modal-thumbnails">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          className={`thumb-btn ${activeImageIdx === idx ? "active" : ""}`}
                          onClick={() => setActiveImageIdx(idx)}
                        >
                          <img src={formatImageUrl(img)} alt="thumbnail" />
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="viewer-hint">Mueve el mouse sobre la foto para verla en 3D 📐</span>
                </div>

                {/* Specs / Buy Details */}
                <div className="modal-info-column">
                  <span className="modal-eyebrow">{selectedProduct.brand || selectedProduct.category}</span>
                  <h2>{selectedProduct.name}</h2>
                  <strong className="modal-price">
                    ${Number(selectedProduct.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </strong>

                  <p className="modal-description">{specs.description}</p>

                  {/* Technical Specifications */}
                  {!isSpecEmpty && (
                    <div className="specs-container">
                      <h3>Ficha Técnica</h3>
                      <div className="specs-table">
                        {specs.cpu && <div className="spec-row"><Cpu size={16} /><span>Procesador</span><strong>{specs.cpu}</strong></div>}
                        {specs.ram && <div className="spec-row"><Smartphone size={16} /><span>Memoria RAM</span><strong>{specs.ram}</strong></div>}
                        {specs.rom && <div className="spec-row"><Boxes size={16} /><span>Almacenamiento</span><strong>{specs.rom}</strong></div>}
                        {specs.os && <div className="spec-row"><Shield size={16} /><span>Sistema Operativo</span><strong>{specs.os}</strong></div>}
                        {specs.cameras && <div className="spec-row"><MessageSquare size={16} /><span>Cámaras</span><strong>{specs.cameras}</strong></div>}
                      </div>
                    </div>
                  )}

                  <div className="modal-buy-section">
                    <a 
                      href={`https://wa.me/526564101273?text=Hola,%20me%20interesa%20el%20producto:%20${encodeURIComponent(selectedProduct.name)}`}
                      target="_blank"
                      className="btn-whatsapp-buy"
                    >
                      Preguntar por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
