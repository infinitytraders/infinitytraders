import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://infinitytraders.shop';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/checkout'], // Keep admin and checkout pages out of public search results
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
