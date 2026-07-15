import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function TestImagesPage() {
  const products = await db.product.findMany({
    where: { active: true }
  });

  return (
    <div style={{ padding: 40, fontFamily: 'monospace' }}>
      <h1>Product Images JSON Check</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: 20 }}>
            <strong>{p.name}</strong> (ID: {p.id})<br />
            Image URL raw: <code style={{ background: '#f5f5f5', padding: '2px 6px' }}>{JSON.stringify(p.imageUrl)}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
