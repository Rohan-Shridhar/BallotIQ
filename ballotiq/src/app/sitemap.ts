import type { MetadataRoute } from 'next';
import { COUNTRIES } from '@/lib/constants/countries';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ballotiq-61721852903.us-central1.run.app';

  const countryPages = COUNTRIES.map((country) => ({
    url: `${baseUrl}/learn/${country.code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    ...countryPages,
  ];
}
