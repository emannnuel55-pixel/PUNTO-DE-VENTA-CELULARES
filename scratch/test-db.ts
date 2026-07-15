import { db } from "../lib/db";

async function main() {
  const products = await db.product.findMany({
    where: { active: true },
    select: { id: true, name: true, imageUrl: true }
  });
  console.log("PRODUCTOS EN BD:", JSON.stringify(products, null, 2));
}

main().catch(console.error);
