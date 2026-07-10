"use client";
import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

type Product = { id: string; sku: string; name: string; category: string; price: number; stock: number };
type CartItem = Product & { quantity: number };

export default function PosClient({ products }: { products: Product[] }) {
  const [query,setQuery] = useState("");
  const [cart,setCart] = useState<CartItem[]>([]);
  const [paymentMethod,setPaymentMethod] = useState("CASH");
  const [busy,setBusy] = useState(false);
  const [idempotencyKey,setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [result,setResult] = useState<{folio:string,total:number}|null>(null);
  const filtered = useMemo(() => products.filter((p) => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(query.toLowerCase())),[products,query]);
  const total = cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
  function add(product: Product) {
    setCart((current)=>{
      const found=current.find((i)=>i.id===product.id);
      if(found) return current.map((i)=>i.id===product.id?{...i,quantity:Math.min(i.quantity+1,i.stock)}:i);
      return [...current,{...product,quantity:1}];
    });
  }
  function change(id:string,delta:number){setCart((current)=>current.map((i)=>i.id===id?{...i,quantity:Math.max(1,Math.min(i.stock,i.quantity+delta))}:i));}
  async function checkout(){
    if(!cart.length||busy)return;
    setBusy(true);setResult(null);
    try{
      const response=await fetch("/api/sales",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({idempotencyKey,paymentMethod,items:cart.map(({id,quantity})=>({productId:id,quantity}))})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"No fue posible completar la venta.");
      setResult(data);setCart([]);setIdempotencyKey(crypto.randomUUID());
    }catch(error){alert(error instanceof Error?error.message:"Error de venta");}finally{setBusy(false);}
  }
  return <div className="pos-layout">
    <section className="card"><div className="page-header" style={{marginBottom:16}}><div><h3>Catálogo disponible</h3><p>Selecciona productos para agregarlos al carrito.</p></div></div><div className="field"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar por nombre, SKU o categoría..."/></div><div className="product-grid" style={{marginTop:16}}>{filtered.map((p)=><button className="product-tile" onClick={()=>add(p)} disabled={p.stock<1} key={p.id}><strong>{p.name}</strong><span>{p.sku} · {p.category}</span><strong>${p.price.toFixed(2)}</strong><span>Existencia: {p.stock}</span></button>)}</div></section>
    <aside className="card"><h3><ShoppingCart size={20}/> Carrito</h3>{result&&<div className="alert alert-success">Venta {result.folio} registrada por ${result.total.toFixed(2)}.</div>}{cart.length?cart.map((item)=><div className="cart-row" key={item.id}><div><strong>{item.name}</strong><br/><small>${item.price.toFixed(2)} c/u</small></div><div className="inline-actions"><button className="btn btn-small btn-secondary" onClick={()=>change(item.id,-1)}><Minus size={14}/></button><strong>{item.quantity}</strong><button className="btn btn-small btn-secondary" onClick={()=>change(item.id,1)}><Plus size={14}/></button></div><button className="btn btn-small btn-danger" onClick={()=>setCart(cart.filter((i)=>i.id!==item.id))}><Trash2 size={14}/></button></div>):<div className="empty">Agrega productos para iniciar una venta.</div>}<div className="field" style={{marginTop:16}}><label>Método de pago</label><select value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}><option value="CASH">Efectivo</option><option value="TRANSFER">Transferencia</option><option value="CARD_TERMINAL">Terminal externa</option><option value="DIGITAL">Pago digital</option></select></div><div className="total-box"><div className="total-line"><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div><div className="total-line grand"><span>Total</span><strong>${total.toFixed(2)}</strong></div></div><button className="btn btn-primary" onClick={checkout} disabled={!cart.length||busy} style={{width:"100%",marginTop:14}}>{busy?"Procesando...":"Cobrar venta"}</button></aside>
  </div>;
}
