import { ProductsClient } from "@/components/ProductsClient";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { inventoryRoles } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireUser(inventoryRoles);
  
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: [
      { category: "asc" },
      { name: "asc" }
    ]
  });

  return <ProductsClient products={products} />;
}
