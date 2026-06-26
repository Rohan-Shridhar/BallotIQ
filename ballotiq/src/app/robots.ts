import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ballotiq-61721852903.us-central1.run.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/choose-path'],
        disallow: ['/api/', '/assess', '/quiz', '/learn/', '/assistant', '/polling-stations'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
