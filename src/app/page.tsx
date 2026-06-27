import { db } from '@/lib/db';
import HomeClient from '@/components/HomeClient';

// Ensure the page gets re-rendered dynamically when data changes
export const revalidate = 0;
export const runtime = 'edge';

export default async function HomePage() {
  const products = await db.getProducts();

  return <HomeClient initialProducts={products} />;
}
