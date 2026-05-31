import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://beyondthepain.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Example of path you might want to hide from search engines
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
