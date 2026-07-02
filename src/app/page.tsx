import { db } from '@/lib/db';
import HomeClient from '@/components/HomeClient';

// Ensure the page gets re-rendered dynamically when data changes
export const revalidate = 0;
export const runtime = 'nodejs';

export default async function HomePage() {
  const products = await db.getProducts();

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Infinity Traders',
    'url': 'https://infinitytraders.shop',
    'logo': 'https://infinitytraders.shop/icon.svg',
    'description': "Dhanbad's premier multi-brand distributor of premium performance running shoes, activewear recovery slides, and sportswear apparel.",
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+91-62021-06616',
      'contactType': 'customer service',
      'areaServed': 'IN',
      'availableLanguage': ['en', 'hi']
    }
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Infinity Traders',
    'url': 'https://infinitytraders.shop',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://infinitytraders.shop/shop?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Infinity Traders Depot & HQ',
    'image': 'https://infinitytraders.shop/categories/sneakers.jpg',
    'telephone': '+91 62021 06616',
    'email': 'support@infinitytraders.shop',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Dhanbad Bypass Road',
      'addressLocality': 'Dhanbad',
      'addressRegion': 'Jharkhand',
      'postalCode': '826001',
      'addressCountry': 'IN'
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      'opens': '11:00',
      'closes': '20:30'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <HomeClient initialProducts={products} />
    </>
  );
}
