/**
 * Tests for robots.ts and sitemap.ts SEO metadata routes.
 */

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { COUNTRIES } from '@/lib/constants/countries';

describe('SEO Metadata Routes', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('robots.ts', () => {
    it('returns valid robots rules and uses fallback base URL when environment variable is unset', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      const result = robots();

      expect(result).toBeDefined();
      expect(result.rules).toEqual([
        {
          userAgent: '*',
          allow: ['/', '/choose-path'],
          disallow: ['/api/', '/assess', '/quiz', '/learn/', '/assistant', '/polling-stations'],
        },
      ]);
      expect(result.sitemap).toBe('https://ballotiq-61721852903.us-central1.run.app/sitemap.xml');
    });

    it('uses NEXT_PUBLIC_BASE_URL for the sitemap URL when environment variable is set', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://custom-domain.com';
      const result = robots();

      expect(result.sitemap).toBe('https://custom-domain.com/sitemap.xml');
    });
  });

  describe('sitemap.ts', () => {
    it('generates correct sitemap structure using fallback base URL when env is unset', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      const result = sitemap();

      expect(result).toBeDefined();
      // Should have homepage + COUNTRIES.length entries
      expect(result.length).toBe(1 + COUNTRIES.length);

      // Verify homepage entry
      const homeEntry = result.find(entry => entry.url === 'https://ballotiq-61721852903.us-central1.run.app');
      expect(homeEntry).toBeDefined();
      expect(homeEntry?.changeFrequency).toBe('weekly');
      expect(homeEntry?.priority).toBe(1.0);

      // Verify country entries
      COUNTRIES.forEach((country) => {
        const countryUrl = `https://ballotiq-61721852903.us-central1.run.app/learn/${country.code.toLowerCase()}`;
        const countryEntry = result.find(entry => entry.url === countryUrl);
        expect(countryEntry).toBeDefined();
        expect(countryEntry?.changeFrequency).toBe('monthly');
        expect(countryEntry?.priority).toBe(0.8);
      });
    });

    it('generates correct sitemap structure using NEXT_PUBLIC_BASE_URL when set', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://my-app.vercel.app';
      const result = sitemap();

      expect(result.length).toBe(1 + COUNTRIES.length);

      // Verify homepage entry uses new domain
      const homeEntry = result.find(entry => entry.url === 'https://my-app.vercel.app');
      expect(homeEntry).toBeDefined();
      expect(homeEntry?.changeFrequency).toBe('weekly');
      expect(homeEntry?.priority).toBe(1.0);

      // Verify country entries use new domain
      COUNTRIES.forEach((country) => {
        const countryUrl = `https://my-app.vercel.app/learn/${country.code.toLowerCase()}`;
        const countryEntry = result.find(entry => entry.url === countryUrl);
        expect(countryEntry).toBeDefined();
        expect(countryEntry?.changeFrequency).toBe('monthly');
        expect(countryEntry?.priority).toBe(0.8);
      });
    });
  });
});
