import PosClient from "@/app/panel/pos/PosClient";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { salesRoles } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const user=await requireUser(salesRoles);
  const products=await db.product.findMany({where:{active:true,stock:{gt:0},...(user.branchId?{branchId:user.branchId}:{})},orderBy:{name:"asc"}});
  return <><div className="page-header"><div><h2>Punto de venta</h2><p>Venta rápida con validación transaccional de inventario.</p></div></div><PosClient products={products.map((p)=>({id:p.id,sku:p.sku,name:p.name,category:p.category,price:Number(p.price),stock:p.stock}))}/></>;
}
