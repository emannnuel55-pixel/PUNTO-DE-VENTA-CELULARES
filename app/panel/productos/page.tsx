import { createProduct, adjustStock, updateProduct, deleteProduct } from "@/app/actions/products";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { requireUser } from "@/lib/auth";
import { inventoryRoles } from "@/lib/permissions";
import { SkuGenerator } from "@/components/SkuGenerator";
import { CameraCapture } from "@/components/CameraCapture";

export const dynamic = "force-dynamic";

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

export default async function ProductsPage() {
  await requireUser(inventoryRoles);
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { movements: { take: 3, orderBy: { createdAt: "desc" } } }
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Inventario</h2>
          <p>Productos, refacciones, existencias y movimientos.</p>
        </div>
      </div>

      <section className="card" style={{ marginBottom: 20 }}>
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
                        <details>
                          <summary className="btn btn-small btn-secondary">Stock</summary>
                          <form action={adjustStock.bind(null, p.id)} className="form-grid one" style={{ minWidth: 250, marginTop: 12 }}>
                            <div className="field">
                              <label>Cantidad (+/-)</label>
                              <input name="quantity" type="number" required />
                            </div>
                            <div className="field">
                              <label>Motivo</label>
                              <input name="notes" required />
                            </div>
                            <button className="btn btn-primary" type="submit">Ajustar</button>
                          </form>
                        </details>
                        
                        <details>
                          <summary className="btn btn-small btn-secondary">Editar</summary>
                          <form action={updateProduct.bind(null, p.id)} className="form-grid" style={{ minWidth: 340, marginTop: 12, padding: 10 }}>
                            <div className="field">
                              <label>Nombre</label>
                              <input name="name" defaultValue={p.name} required />
                            </div>
                            <div className="field">
                              <label>Categoría</label>
                              <input name="category" defaultValue={p.category} required />
                            </div>
                            <div className="field">
                              <label>Marca</label>
                              <input name="brand" defaultValue={p.brand || ""} />
                            </div>
                            <div className="field">
                              <label>Costo</label>
                              <input name="cost" type="number" min="0" step="0.01" defaultValue={p.cost.toString()} required />
                            </div>
                            <div className="field">
                              <label>Precio</label>
                              <input name="price" type="number" min="0" step="0.01" defaultValue={p.price.toString()} required />
                            </div>
                            <div className="field">
                              <label>Mínimo</label>
                              <input name="minimumStock" type="number" min="0" defaultValue={p.minimumStock} required />
                            </div>

                            {/* Ficha técnica */}
                            <div className="field full">
                              <label>Descripción del Producto</label>
                              <textarea name="desc" defaultValue={specs.description} rows={3} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", padding: "8px" }} />
                            </div>
                            <div className="field">
                              <label>Procesador (CPU)</label>
                              <input name="cpu" defaultValue={specs.cpu} />
                            </div>
                            <div className="field">
                              <label>RAM</label>
                              <input name="ram" defaultValue={specs.ram} />
                            </div>
                            <div className="field">
                              <label>Almacenamiento (ROM)</label>
                              <input name="rom" defaultValue={specs.rom} />
                            </div>
                            <div className="field">
                              <label>Sistema Operativo</label>
                              <input name="os" defaultValue={specs.os} />
                            </div>
                            <div className="field full">
                              <label>Cámaras</label>
                              <input name="cameras" defaultValue={specs.cameras} />
                            </div>

                            <div className="field full" style={{ gridColumn: "span 2" }}>
                              <CameraCapture multiple={true} name="imageUrl" label="Fotografías / Vista 3D (Subir Varias)" defaultValue={p.imageUrl || undefined} />
                            </div>
                            <div className="field full" style={{ gridColumn: "span 2", marginTop: 10 }}>
                              <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>Guardar Cambios</button>
                            </div>
                          </form>
                        </details>
                        
                        <form action={deleteProduct.bind(null, p.id)} method="post" style={{ display: "inline" }}>
                          <button className="btn btn-small btn-danger" type="submit">Eliminar</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MÓVIL (iOS / APK STYLE LIST) */}
        <div className="mobile-only mobile-list-container">
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
                  <details style={{ flex: 1 }}>
                    <summary className="btn btn-small btn-secondary" style={{ width: "100%" }}>Stock</summary>
                    <form action={adjustStock.bind(null, p.id)} className="form-grid one" style={{ minWidth: "100%", marginTop: 12 }}>
                      <div className="field">
                        <label>Cantidad (+/-)</label>
                        <input name="quantity" type="number" required />
                      </div>
                      <div className="field">
                        <label>Motivo</label>
                        <input name="notes" required />
                      </div>
                      <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>Ajustar</button>
                    </form>
                  </details>
                  
                  <details style={{ flex: 1 }}>
                    <summary className="btn btn-small btn-secondary" style={{ width: "100%" }}>Editar</summary>
                    <form action={updateProduct.bind(null, p.id)} className="form-grid one" style={{ minWidth: "100%", marginTop: 12 }}>
                      <div className="field">
                        <label>Nombre</label>
                        <input name="name" defaultValue={p.name} required />
                      </div>
                      <div className="field">
                        <label>Categoría</label>
                        <input name="category" defaultValue={p.category} required />
                      </div>
                      <div className="field">
                        <label>Marca</label>
                        <input name="brand" defaultValue={p.brand || ""} />
                      </div>
                      <div className="field">
                        <label>Costo</label>
                        <input name="cost" type="number" min="0" step="0.01" defaultValue={p.cost.toString()} required />
                      </div>
                      <div className="field">
                        <label>Precio</label>
                        <input name="price" type="number" min="0" step="0.01" defaultValue={p.price.toString()} required />
                      </div>
                      <div className="field">
                        <label>Mínimo</label>
                        <input name="minimumStock" type="number" min="0" defaultValue={p.minimumStock} required />
                      </div>

                      {/* Ficha técnica móvil */}
                      <div className="field">
                        <label>Descripción</label>
                        <textarea name="desc" defaultValue={specs.description} rows={3} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", padding: "8px" }} />
                      </div>
                      <div className="field">
                        <label>CPU</label>
                        <input name="cpu" defaultValue={specs.cpu} />
                      </div>
                      <div className="field">
                        <label>RAM</label>
                        <input name="ram" defaultValue={specs.ram} />
                      </div>
                      <div className="field">
                        <label>ROM</label>
                        <input name="rom" defaultValue={specs.rom} />
                      </div>
                      <div className="field">
                        <label>OS</label>
                        <input name="os" defaultValue={specs.os} />
                      </div>
                      <div className="field">
                        <label>Cámaras</label>
                        <input name="cameras" defaultValue={specs.cameras} />
                      </div>

                      <div className="field full">
                        <CameraCapture multiple={true} name="imageUrl" label="Fotografías (Subir Varias)" defaultValue={p.imageUrl || undefined} />
                      </div>
                      <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: 10 }}>Guardar</button>
                    </form>
                  </details>
                  
                  <form action={deleteProduct.bind(null, p.id)} method="post" style={{ display: "inline", flex: 1 }}>
                    <button className="btn btn-small btn-danger" type="submit" style={{ width: "100%" }}>Eliminar</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CREACIÓN DE NUEVO PRODUCTO CON MULTIPLES FOTOS E INFO */}
      <section className="card">
        <h3>Nuevo producto</h3>
        <form action={createProduct} className="form-grid">
          <div className="field">
            <label>SKU</label>
            <SkuGenerator />
          </div>
          <div className="field">
            <label>Nombre</label>
            <input name="name" required />
          </div>
          <div className="field">
            <label>Categoría</label>
            <input name="category" required placeholder="Pantallas, baterías..." />
          </div>
          <div className="field">
            <label>Marca</label>
            <input name="brand" />
          </div>
          <div className="field">
            <label>Costo</label>
            <input name="cost" type="number" min="0" step="0.01" required />
          </div>
          <div className="field">
            <label>Precio</label>
            <input name="price" type="number" min="0" step="0.01" required />
          </div>
          <div className="field">
            <label>Existencia inicial</label>
            <input name="stock" type="number" min="0" defaultValue="0" required />
          </div>
          <div className="field">
            <label>Existencia mínima</label>
            <input name="minimumStock" type="number" min="0" defaultValue="1" required />
          </div>

          {/* Ficha técnica */}
          <div className="field full">
            <label>Descripción del Producto</label>
            <textarea name="desc" placeholder="Descripción completa del accesorio o celular..." rows={3} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", padding: "8px" }} />
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
            <input name="cameras" placeholder="Ej. 48 MP + 12 MP + 12 MP" />
          </div>

          <div className="field full">
            <CameraCapture multiple={true} name="imageUrl" label="Fotografías / Galería 3D (Subir Varias)" />
          </div>
          <div className="form-actions field full">
            <button className="btn btn-primary" type="submit">Crear producto</button>
          </div>
        </form>
      </section>
    </>
  );
}
