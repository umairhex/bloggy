import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://bloggy.umairrx.dev';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/editor', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
