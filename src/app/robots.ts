import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/pagamento'],
    },
    sitemap: 'https://autojade.com.br/sitemap.xml',
  };
}
