import { db } from '@/lib/db';
import HomeClient from '@/components/HomeClient';

// Ensure the page gets re-rendered dynamically when data changes
export const revalidate = 0;

export default async function HomePage() {
  const products = await db.getProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <HomeClient initialProducts={products} />
    </div>
  );
}
