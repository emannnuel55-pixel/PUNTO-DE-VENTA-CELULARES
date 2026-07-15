import { ClientAppShell } from "@/components/ClientAppShell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await db.product.findMany({
    where: { active: true },
    take: 24,
    orderBy: { createdAt: "desc" }
  });

  return <ClientAppShell products={products} />;
}
