import { db } from '@/lib/db';
import { getSessionUser } from '@/app/actions';
import ProductDetailClient from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';

export const revalidate = 0;
export const runtime = 'nodejs';

interface Props {
  params: Promise<{ id: string }>;
}

// 1. DYNAMIC SEO METADATA GENERATION
export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const product = await db.getProductById(resolvedParams.id);
  
  if (!product) {
    return {
      title: 'Product Not Found | Infinity Traders',
      description: 'The requested product could not be found.'
    };
  }

  return {
    title: `${product.name} | ${product.brand} | Infinity Traders`,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: `https://infinitytraders.shop/product/${product.id}`,
    },
    openGraph: {
      title: `${product.name} by ${product.brand}`,
      description: product.description.slice(0, 160),
      images: [{ url: product.images[0] }]
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await db.getProductById(resolvedParams.id);
  const user = await getSessionUser();

  if (!product) {
    notFound();
  }

  // Fetch recommendations (similar category or brand, excluding current product)
  const allProducts = await db.getProducts();
  const recommendations = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  // 2. STRUCTURED DATA SCHEMAS FOR GOOGLE SEO
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': product.images,
    'description': product.description,
    'sku': product.sku,
    'brand': {
      '@type': 'Brand',
      'name': product.brand
    },
    'offers': {
      '@type': 'Offer',
      'url': `https://infinitytraders.shop/product/${product.id}`,
      'priceCurrency': 'INR',
      'price': product.sellingPrice,
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'priceValidUntil': '2027-12-31'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.averageRating,
      'reviewCount': product.reviewsCount || 1
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://infinitytraders.shop'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Shop',
        'item': 'https://infinitytraders.shop/shop'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.category,
        'item': `https://infinitytraders.shop/shop?category=${product.category}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': product.name,
        'item': `https://infinitytraders.shop/product/${product.id}`
      }
    ]
  };

  return (
    <>
      {/* Inject schemas in head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ProductDetailClient
        product={product}
        recommendations={recommendations}
        initialUser={user}
      />
    </>
  );
}
