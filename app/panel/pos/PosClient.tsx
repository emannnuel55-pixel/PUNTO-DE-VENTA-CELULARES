"use client";

import { useMemo, useState, useEffect } from "react";
import { Minus, Plus, ShoppingCart, Trash2, Printer, FileText, CheckCircle2, History, CreditCard, Search, Loader2 } from "lucide-react";
import { printTicket, printFormalReceipt } from "@/lib/print-templates";

type Product = { id: string; sku: string; name: string; category: string; price: number; stock: number };
type CartItem = Product & { quantity: number };

export default function PosClient({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState<"pos" | "history">("pos");
  
  // Search & Cart states
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [busy, setBusy] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  
  // Checkout success state (contains full sale object)
  const [result, setResult] = useState<any | null>(null);

  // Sales history state
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Inicializar clave de idempotencia en el cliente para evitar problemas en SSR
  useEffect(() => {
    setIdempotencyKey(self.crypto?.randomUUID?.() || Math.random().toString(36).substring(2));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) =>
      `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Fetch sales history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch("/api/sales");
      if (response.ok) {
        const data = await response.json();
        setSalesHistory(data);
      }
    } catch (error) {
      console.error("Error al obtener historial:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load history on tab change
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  function add(product: Product) {
    setCart((current) => {
      const found = current.find((i) => i.id === product.id);
      if (found) return current.map((i) => (i.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i));
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function change(id: string, delta: number) {
    setCart((current) =>
      current.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(i.stock, i.quantity + delta)) } : i))
    );
  }

  async function checkout() {
    if (!cart.length || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          paymentMethod,
          items: cart.map(({ id, quantity }) => ({ productId: id, quantity }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No fue posible completar la venta.");
      
      setResult(data);
      setCart([]);
      setIdempotencyKey(self.crypto?.randomUUID?.() || Math.random().toString(36).substring(2));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error de venta");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Tabs superiores */}
      <div className="ios-navigation-tabs" style={{ display: "flex", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
        <button
          className={`btn ${activeTab === "pos" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("pos")}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <ShoppingCart size={16} /> Cobrar Venta
        </button>
        <button
          className={`btn ${activeTab === "history" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("history")}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <History size={16} /> Ventas Realizadas (Historial)
        </button>
      </div>

      {activeTab === "pos" && (
        <div className="pos-layout">
          {/* Catálogo de productos */}
          <section className="card">
            <div className="page-header" style={{ marginBottom: 16 }}>
              <div>
                <h3>Catálogo disponible</h3>
                <p>Selecciona productos para agregarlos al carrito.</p>
              </div>
            </div>
            <div className="field">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, SKU o categoría..."
              />
            </div>
            <div className="product-grid" style={{ marginTop: 16 }}>
              {filtered.map((p) => (
                <button
                  className="product-tile"
                  onClick={() => add(p)}
                  disabled={p.stock < 1}
                  key={p.id}
                >
                  <strong>{p.name}</strong>
                  <span>{p.sku} · {p.category}</span>
                  <strong>${p.price.toFixed(2)}</strong>
                  <span>Existencia: {p.stock}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Carrito de compra y panel de cobro */}
          <aside className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3><ShoppingCart size={20} /> Carrito</h3>

            {/* Alerta de venta exitosa con impresión de Tickets */}
            {result && (
              <div className="alert alert-success" style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontWeight: "bold" }}>
                  <CheckCircle2 size={18} />
                  <span>Venta {result.folio} Registrada</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#a1a1a6" }}>
                  Total cobrado: <strong>${Number(result.total).toFixed(2)}</strong>
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginTop: "4px" }}>
                  <button 
                    className="btn btn-small btn-secondary" 
                    onClick={() => printTicket(result)}
                    style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                  >
                    <Printer size={14} /> Imprimir Ticket Digital
                  </button>
                  <button 
                    className="btn btn-small btn-secondary" 
                    onClick={() => printFormalReceipt(result, "client")}
                    style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                  >
                    <FileText size={14} /> Recibo PDF Cliente
                  </button>
                  <button 
                    className="btn btn-small btn-secondary" 
                    onClick={() => printFormalReceipt(result, "owner")}
                    style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                  >
                    <FileText size={14} /> Recibo PDF Mío
                  </button>
                </div>
              </div>
            )}

            {cart.length ? (
              cart.map((item) => (
                <div className="cart-row" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <br />
                    <small>${item.price.toFixed(2)} c/u</small>
                  </div>
                  <div className="inline-actions">
                    <button className="btn btn-small btn-secondary" onClick={() => change(item.id, -1)}>
                      <Minus size={14} />
                    </button>
                    <strong>{item.quantity}</strong>
                    <button className="btn btn-small btn-secondary" onClick={() => change(item.id, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button className="btn btn-small btn-danger" onClick={() => setCart(cart.filter((i) => i.id !== item.id))}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty">Agrega productos para iniciar una venta.</div>
            )}

            <div className="field" style={{ marginTop: 10 }}>
              <label>Método de pago</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="CASH">Efectivo</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="CARD_TERMINAL">Terminal externa</option>
                <option value="DIGITAL">Pago digital</option>
              </select>
            </div>

            <div className="total-box">
              <div className="total-line">
                <span>Subtotal</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <div className="total-line grand">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={checkout}
              disabled={!cart.length || busy}
              style={{ width: "100%", height: 50, marginTop: "4px" }}
            >
              {busy ? <Loader2 className="premium-spinner" size={20} /> : "Cobrar venta"}
            </button>
          </aside>
        </div>
      )}

      {/* Historial de ventas realizadas */}
      {activeTab === "history" && (
        <section className="card">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h3>Historial de Ventas</h3>
              <p>Visualiza y reimprime los comprobantes de tus transacciones registradas.</p>
            </div>
            <button className="btn btn-secondary" onClick={fetchHistory} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              Actualizar
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <Loader2 className="premium-spinner" size={32} />
            </div>
          ) : salesHistory.length === 0 ? (
            <div className="empty">No se han registrado ventas en esta sucursal todavía.</div>
          ) : (
            <>
              {/* Tabla de escritorio */}
              <div className="table-wrap desktop-only">
                <table>
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Fecha</th>
                      <th>Atendió</th>
                      <th>Método</th>
                      <th>Total</th>
                      <th style={{ textAlign: "right" }}>Comprobantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesHistory.map((sale) => {
                      const payMethod = sale.payments?.[0]?.method || "CASH";
                      const date = new Date(sale.createdAt).toLocaleString("es-MX", { timeZone: "America/Mexico_City" });
                      return (
                        <tr key={sale.id}>
                          <td><strong>{sale.folio}</strong></td>
                          <td>{date}</td>
                          <td>{sale.user?.name || "Vendedor"}</td>
                          <td>{formatPaymentMethod(payMethod)}</td>
                          <td><strong>${Number(sale.total).toFixed(2)}</strong></td>
                          <td style={{ textAlign: "right" }}>
                            <div className="inline-actions" style={{ justifyContent: "flex-end", gap: "6px" }}>
                              <button className="btn btn-small btn-secondary" onClick={() => printTicket(sale)} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                <Printer size={12} /> Ticket
                              </button>
                              <button className="btn btn-small btn-secondary" onClick={() => printFormalReceipt(sale, "client")} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                <FileText size={12} /> PDF Cliente
                              </button>
                              <button className="btn btn-small btn-secondary" onClick={() => printFormalReceipt(sale, "owner")} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                <FileText size={12} /> PDF Propietario
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Lista móvil de tarjetas */}
              <div className="mobile-only mobile-list-container">
                {salesHistory.map((sale) => {
                  const payMethod = sale.payments?.[0]?.method || "CASH";
                  const date = new Date(sale.createdAt).toLocaleString("es-MX", { timeZone: "America/Mexico_City" });
                  return (
                    <div key={sale.id} className="mobile-list-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="mobile-list-card-header">
                        <strong>{sale.folio}</strong>
                        <span>{formatPaymentMethod(payMethod)}</span>
                      </div>
                      <div className="mobile-list-card-body">
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem", color: "#fff" }}>
                          ${Number(sale.total).toFixed(2)}
                        </p>
                        <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.8rem" }}>
                          Fecha: {date}
                        </p>
                        <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.8rem" }}>
                          Vendedor: {sale.user?.name || "Vendedor"}
                        </p>
                      </div>
                      <div className="inline-actions" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", marginTop: "5px", flexDirection: "column", gap: "8px" }}>
                        <button className="btn btn-small btn-secondary" onClick={() => printTicket(sale)} style={{ width: "100%", display: "flex", justifyContent: "center", gap: "6px" }}>
                          <Printer size={14} /> Imprimir Ticket
                        </button>
                        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                          <button className="btn btn-small btn-secondary" onClick={() => printFormalReceipt(sale, "client")} style={{ flex: 1, display: "flex", justifyContent: "center", gap: "4px" }}>
                            <FileText size={14} /> PDF Cliente
                          </button>
                          <button className="btn btn-small btn-secondary" onClick={() => printFormalReceipt(sale, "owner")} style={{ flex: 1, display: "flex", justifyContent: "center", gap: "4px" }}>
                            <FileText size={14} /> PDF Mío
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
