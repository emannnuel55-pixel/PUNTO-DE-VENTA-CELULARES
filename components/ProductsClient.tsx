"use client";

import { useState } from "react";
import { createProduct, adjustStock, updateProduct, deleteProduct } from "@/app/actions/products";
import { formatMoney } from "@/lib/money";
import { SkuGenerator } from "@/components/SkuGenerator";
import { CameraCapture } from "@/components/CameraCapture";
import { Store, Edit, Trash2, Wrench, X, ShieldAlert, CheckCircle2, Loader2, Plus, Sliders } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: any;
  cost: any;
  stock: number;
  minimumStock: number;
  imageUrl: string | null;
  brand: string | null;
  category: string | null;
}

export function ProductsClient({ products }: { products: Product[] }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingStockProduct, setAdjustingStockProduct] = useState<Product | null>(null);
  
  // Form status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper to parse description JSON specs
  const parseDescription = (descStr: string | null) => {
    let specs = { description: "", ram: "", rom: "", cpu: "", os: "", cameras: "" };
    if (descStr) {
      try {
        if (descStr.startsWith("{") && descStr.endsWith("}")) {
          specs = { ...specs, ...JSON.parse(descStr) };
        } else {
          specs.description = descStr;
        }
      } catch (e) {
        specs.description = descStr;
      }
    }
    return specs;
  };

  // Client-side validation and programmatic submission
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    
    // Client-side validations
    const name = formData.get("name")?.toString().trim();
    const category = formData.get("category")?.toString().trim();
    const cost = Number(formData.get("cost"));
    const price = Number(formData.get("price"));

    if (!name) {
      setError("El nombre del producto es obligatorio.");
      setLoading(false);
      return;
    }
    if (!category) {
      setError("La categoría es obligatoria.");
      setLoading(false);
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setError("El costo debe ser un número mayor o igual a 0.");
      setLoading(false);
      return;
    }
    if (isNaN(price) || price < 0) {
      setError("El precio debe ser un número mayor o igual a 0.");
      setLoading(false);
      return;
    }

    try {
      await updateProduct(editingProduct.id, formData);
      setSuccess("¡Producto guardado exitosamente!");
      setEditingProduct(null);
      
      // Auto-hide success message
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el producto. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adjustingStockProduct) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get("quantity"));
    const notes = formData.get("notes")?.toString().trim();

    if (!quantity || isNaN(quantity)) {
      setError("La cantidad de stock a ajustar es inválida.");
      setLoading(false);
      return;
    }
    if (!notes) {
      setError("Debes indicar un motivo para el ajuste.");
      setLoading(false);
      return;
    }

    try {
      await adjustStock(adjustingStockProduct.id, formData);
      setSuccess("¡Stock ajustado con éxito!");
      setAdjustingStockProduct(null);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "Error al ajustar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString().trim();
    const category = formData.get("category")?.toString().trim();
    const cost = Number(formData.get("cost"));
    const price = Number(formData.get("price"));

    if (!name || !category || isNaN(cost) || isNaN(price)) {
      setError("Completa todos los campos obligatorios del nuevo producto.");
      setLoading(false);
      return;
    }

    try {
      await createProduct(formData);
      setSuccess("¡Producto creado con éxito!");
      e.currentTarget.reset();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "No fue posible crear el producto.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto del inventario?")) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteProduct(id);
      setSuccess("Producto eliminado del inventario.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError("Error al eliminar el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Alertas de Feedback Flotantes */}
      {error && (
        <div className="app-toast toast-error">
          <ShieldAlert size={20} />
          <span>{error}</span>
          <button className="toast-close" onClick={() => setError(null)}><X size={14}/></button>
        </div>
      )}
      {success && (
        <div className="app-toast toast-success">
          <CheckCircle2 size={20} />
          <span>{success}</span>
          <button className="toast-close" onClick={() => setSuccess(null)}><X size={14}/></button>
        </div>
      )}

      {/* BANNER DE SECCIÓN */}
      <div className="page-header">
        <div>
          <h2>Inventario</h2>
          <p>Productos, refacciones, existencias y movimientos.</p>
        </div>
      </div>

      {/* VISTA ESCRITORIO (TABLA) */}
      <section className="card desktop-only" style={{ marginBottom: 20 }}>
        <h3>Existencias actuales</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Costo</th>
                <th>Precio</th>
                <th>Existencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const specs = parseDescription(p.description);
                return (
                  <tr key={p.id}>
                    <td><strong>{p.sku}</strong></td>
                    <td>
                      {p.name}
                      <br />
                      <small className="muted">{p.brand || "Sin marca"}</small>
                    </td>
                    <td>{p.category}</td>
                    <td>{formatMoney(p.cost.toString())}</td>
                    <td>{formatMoney(p.price.toString())}</td>
                    <td>
                      <span className={`badge ${p.stock <= p.minimumStock ? "danger" : "success"}`}>
                        {p.stock} unidades
                      </span>
                      <br />
                      <small>Mínimo: {p.minimumStock}</small>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={() => setAdjustingStockProduct(p)}
                        >
                          <Sliders size={14} /> Stock
                        </button>
                        
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={() => setEditingProduct(p)}
                        >
                          <Edit size={14} /> Editar
                        </button>
                        
                        <button 
                          className="btn btn-small btn-danger"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* VISTA MÓVIL (iOS / APK STYLE LIST CARDS) */}
      <section className="mobile-only" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Existencias actuales</h3>
        <div className="mobile-list-container">
          {products.map((p) => {
            const specs = parseDescription(p.description);
            return (
              <div key={p.id} className="mobile-list-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="mobile-list-card-header">
                  <strong>{p.sku}</strong>
                  <span className={`badge ${p.stock <= p.minimumStock ? "danger" : "success"}`}>
                    {p.stock} unidades
                  </span>
                </div>
                <div className="mobile-list-card-body">
                  <p className="device-info">{p.name}</p>
                  <p className="customer-info">{p.brand || "Sin marca"} · {p.category}</p>
                  <p className="muted" style={{ fontSize: "0.8rem", marginTop: 4 }}>
                    Costo: {formatMoney(p.cost.toString())} | Precio: {formatMoney(p.price.toString())}
                  </p>
                </div>
                <div className="inline-actions" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", marginTop: "5px" }}>
                  <button 
                    className="btn btn-small btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => setAdjustingStockProduct(p)}
                  >
                    <Sliders size={14} /> Stock
                  </button>
                  
                  <button 
                    className="btn btn-small btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => setEditingProduct(p)}
                  >
                    <Edit size={14} /> Editar
                  </button>
                  
                  <button 
                    className="btn btn-small btn-danger" 
                    style={{ flex: 1 }}
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL DE EDICIÓN FLOTANTE (iOS Bottom Sheet / Modal Shell) */}
      {editingProduct && (() => {
        const specs = parseDescription(editingProduct.description);
        return (
          <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
            <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
              <div className="sheet-header">
                <h3>Editar Producto</h3>
                <button className="close-sheet-btn" onClick={() => setEditingProduct(null)}><X size={20}/></button>
              </div>

              <form onSubmit={handleUpdate} className="form-grid one" style={{ gap: "16px" }}>
                <div className="field">
                  <label>Nombre del Producto *</label>
                  <input name="name" defaultValue={editingProduct.name} required />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="field">
                    <label>Categoría *</label>
                    <input name="category" defaultValue={editingProduct.category || ""} required />
                  </div>
                  <div className="field">
                    <label>Marca</label>
                    <input name="brand" defaultValue={editingProduct.brand || ""} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div className="field">
                    <label>Costo ($) *</label>
                    <input name="cost" type="number" min="0" step="0.01" defaultValue={editingProduct.cost.toString()} required />
                  </div>
                  <div className="field">
                    <label>Precio ($) *</label>
                    <input name="price" type="number" min="0" step="0.01" defaultValue={editingProduct.price.toString()} required />
                  </div>
                  <div className="field">
                    <label>Mínimo Stock *</label>
                    <input name="minimumStock" type="number" min="0" defaultValue={editingProduct.minimumStock} required />
                  </div>
                </div>

                {/* Ficha técnica */}
                <div className="field">
                  <label>Descripción Completa</label>
                  <textarea name="desc" defaultValue={specs.description} rows={3} placeholder="Detalles comerciales..." style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", padding: "8px", outline: "none" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="field">
                    <label>Procesador (CPU)</label>
                    <input name="cpu" defaultValue={specs.cpu} placeholder="Ej. A17 Pro" />
                  </div>
                  <div className="field">
                    <label>Memoria RAM</label>
                    <input name="ram" defaultValue={specs.ram} placeholder="Ej. 8 GB" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="field">
                    <label>Almacenamiento (ROM)</label>
                    <input name="rom" defaultValue={specs.rom} placeholder="Ej. 256 GB" />
                  </div>
                  <div className="field">
                    <label>Sistema Operativo</label>
                    <input name="os" defaultValue={specs.os} placeholder="Ej. iOS 17" />
                  </div>
                </div>

                <div className="field">
                  <label>Cámaras</label>
                  <input name="cameras" defaultValue={specs.cameras} placeholder="Ej. 48 MP + 12 MP" />
                </div>

                <div className="field full">
                  <CameraCapture multiple={true} name="imageUrl" label="Fotografías / Vista 3D (Subir Varias)" defaultValue={editingProduct.imageUrl || undefined} />
                </div>

                <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", height: 50, marginTop: 10 }}>
                  {loading ? <Loader2 className="premium-spinner" size={20} /> : "Guardar Cambios"}
                </button>
              </form>
            </div>
          </div>
        );
      })()}

      {/* MODAL DE AJUSTE DE STOCK */}
      {adjustingStockProduct && (
        <div className="modal-overlay" onClick={() => setAdjustingStockProduct(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="sheet-header">
              <h3>Ajustar Existencia</h3>
              <button className="close-sheet-btn" onClick={() => setAdjustingStockProduct(null)}><X size={20}/></button>
            </div>
            <form onSubmit={handleAdjustStock} className="form-grid one" style={{ gap: "16px" }}>
              <div className="field">
                <label>Cantidad a Sumar o Restar (+ / -)</label>
                <input name="quantity" type="number" placeholder="Ej. 5 o -3" required />
              </div>
              <div className="field">
                <label>Motivo del Ajuste</label>
                <input name="notes" placeholder="Ej. Compra de inventario, merma..." required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", height: 50, marginTop: 10 }}>
                {loading ? <Loader2 className="premium-spinner" size={20} /> : "Ajustar Stock"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREACIÓN DE NUEVO PRODUCTO */}
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Nuevo producto</h3>
        <form onSubmit={handleCreate} className="form-grid">
          <div className="field">
            <label>SKU *</label>
            <SkuGenerator />
          </div>
          <div className="field">
            <label>Nombre del Producto *</label>
            <input name="name" required />
          </div>
          <div className="field">
            <label>Categoría *</label>
            <input name="category" required placeholder="Pantallas, baterías..." />
          </div>
          <div className="field">
            <label>Marca</label>
            <input name="brand" />
          </div>
          <div className="field">
            <label>Costo ($) *</label>
            <input name="cost" type="number" min="0" step="0.01" required />
          </div>
          <div className="field">
            <label>Precio ($) *</label>
            <input name="price" type="number" min="0" step="0.01" required />
          </div>
          <div className="field">
            <label>Existencia inicial *</label>
            <input name="stock" type="number" min="0" defaultValue="0" required />
          </div>
          <div className="field">
            <label>Existencia mínima *</label>
            <input name="minimumStock" type="number" min="0" defaultValue="1" required />
          </div>

          {/* Ficha técnica */}
          <div className="field full">
            <label>Descripción del Producto</label>
            <textarea name="desc" placeholder="Descripción completa del accesorio o celular..." rows={3} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", padding: "8px", outline: "none" }} />
          </div>
          <div className="field">
            <label>Procesador (CPU)</label>
            <input name="cpu" placeholder="Ej. Apple A17 Pro" />
          </div>
          <div className="field">
            <label>Memoria RAM</label>
            <input name="ram" placeholder="Ej. 8 GB" />
          </div>
          <div className="field">
            <label>Almacenamiento (ROM)</label>
            <input name="rom" placeholder="Ej. 256 GB" />
          </div>
          <div className="field">
            <label>Sistema Operativo</label>
            <input name="os" placeholder="Ej. iOS 17" />
          </div>
          <div className="field full">
            <label>Cámaras</label>
            <input name="cameras" placeholder="Ej. 48 MP + 12 MP" />
          </div>

          <div className="field full">
            <CameraCapture multiple={true} name="imageUrl" label="Fotografías / Galería 3D (Subir Varias)" />
          </div>
          <div className="form-actions field full">
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 50 }}>
              {loading ? <Loader2 className="premium-spinner" size={20} /> : "Crear producto"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
