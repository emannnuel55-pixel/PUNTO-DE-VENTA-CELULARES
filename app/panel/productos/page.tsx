import { createProduct, adjustStock } from "@/app/actions/products";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { requireUser } from "@/lib/auth";
import { inventoryRoles } from "@/lib/permissions";
import { SkuGenerator } from "@/components/SkuGenerator";
import { CameraCapture } from "@/components/CameraCapture";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireUser(inventoryRoles);
  const products = await db.product.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { name: "asc" }], include: { movements: { take: 3, orderBy: { createdAt: "desc" } } } });
  return <>
    <div className="page-header"><div><h2>Inventario</h2><p>Productos, refacciones, existencias y movimientos.</p></div></div>
    <section className="card" style={{marginBottom:20}}><h3>Existencias actuales</h3><div className="table-wrap"><table><thead><tr><th>SKU</th><th>Producto</th><th>Categoría</th><th>Costo</th><th>Precio</th><th>Existencia</th><th>Ajustar</th></tr></thead><tbody>{products.map((p) => <tr key={p.id}><td><strong>{p.sku}</strong></td><td>{p.name}<br/><small className="muted">{p.brand || "Sin marca"}</small></td><td>{p.category}</td><td>{formatMoney(p.cost.toString())}</td><td>{formatMoney(p.price.toString())}</td><td><span className={`badge ${p.stock <= p.minimumStock ? "danger" : "success"}`}>{p.stock} unidades</span><br/><small>Mínimo: {p.minimumStock}</small></td><td><details><summary className="btn btn-small btn-secondary">Movimiento</summary><form action={adjustStock.bind(null,p.id)} className="form-grid one" style={{minWidth:280,marginTop:12}}><div className="field"><label>Cantidad (+ entrada / - salida)</label><input name="quantity" type="number" required/></div><div className="field"><label>Motivo</label><input name="notes" required/></div><button className="btn btn-primary" type="submit">Aplicar ajuste</button></form></details></td></tr>)}</tbody></table></div></section>
    <section className="card"><h3>Nuevo producto</h3><form action={createProduct} className="form-grid"><div className="field"><label>SKU</label><SkuGenerator /></div><div className="field"><label>Nombre</label><input name="name" required/></div><div className="field"><label>Categoría</label><input name="category" required placeholder="Pantallas, baterías..."/></div><div className="field"><label>Marca</label><input name="brand"/></div><div className="field"><label>Costo</label><input name="cost" type="number" min="0" step="0.01" required/></div><div className="field"><label>Precio</label><input name="price" type="number" min="0" step="0.01" required/></div><div className="field"><label>Existencia inicial</label><input name="stock" type="number" min="0" defaultValue="0" required/></div><div className="field"><label>Existencia mínima</label><input name="minimumStock" type="number" min="0" defaultValue="1" required/></div><div className="field full"><CameraCapture multiple={false} name="imageUrl" label="Fotografía del producto (para la venta)" /></div><div className="form-actions field full"><button className="btn btn-primary" type="submit">Crear producto</button></div></form></section>
  </>;
}
