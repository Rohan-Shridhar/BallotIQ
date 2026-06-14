/**
 * FAQ Coverage Map utility.
 *
 * Introspects the FAQ database at call-time and produces a coverage report
 * that maps each country code to the set of intents it has FAQ entries for.
 *
 * Used by:
 *  - Jest coverage-gate tests (fail CI when a supported country has no FAQ coverage)
 *  - Dev-only /api/debug/faq-coverage route
 *  - Logging inside hybridAssistant to surface gaps
 *
 * This module has zero runtime dependencies on Firebase or Gemini, so it is
 * safe to import in both server and client contexts and runs in <1 ms.
 */

import { COUNTRIES } from '@/lib/constants/countries';
import type { AssistantIntent } from './intentEngine';
import { FAQ_DATA, MINIMUM_REQUIRED_INTENTS } from './faqDatabase';

/** Per-country coverage detail. */
export interface CountryCoverage {
  /** ISO 3166-1 alpha-2 country code. */
  countryCode: string;
  /** Human-readable country name. */
  countryName: string;
  /** Intents that have FAQ entries for this country. */
  coveredIntents: AssistantIntent[];
  /** Required intents that are missing FAQ entries. */
  missingRequiredIntents: AssistantIntent[];
  /** Whether all required intents are covered. */
  fullyRequired: boolean;
}

/** Aggregate coverage report. */
export interface CoverageReport {
  /** Coverage detail per supported country. */
  countries: CountryCoverage[];
  /** ISO timestamp when the report was generated. */
  generatedAt: string;
  /** True only when every supported country passes the required-intent gate. */
  allRequiredCovered: boolean;
}

/**
 * Builds and returns a FAQ coverage report for all countries currently listed
 * in the COUNTRIES constant.
 *
 * This is a pure, synchronous function — no I/O, safe to call in tests.
 */
export function getCoverageReport(): CoverageReport {
  const countries: CountryCoverage[] = COUNTRIES.map((country) => {
    const countryFAQ = FAQ_DATA[country.code] ?? {};
    const coveredIntents = Object.keys(countryFAQ) as AssistantIntent[];

    const missingRequiredIntents = MINIMUM_REQUIRED_INTENTS.filter(
      (intent) => !coveredIntents.includes(intent),
    );

    return {
      countryCode: country.code,
      countryName: country.name,
      coveredIntents,
      missingRequiredIntents,
      fullyRequired: missingRequiredIntents.length === 0,
    };
  });

  return {
    countries,
    generatedAt: new Date().toISOString(),
    allRequiredCovered: countries.every((c) => c.fullyRequired),
  };
}

/**
 * Returns the set of covered intents for a specific country.
 * Useful for a quick per-country check inside hybridAssistant.
 *
 * @param countryCode - ISO 3166-1 alpha-2 code (case-insensitive)
 * @returns Set of AssistantIntent values that have FAQ entries
 */
export function getCoveredIntents(countryCode: string): Set<AssistantIntent> {
  const code = countryCode.toUpperCase();
  const countryFAQ = FAQ_DATA[code] ?? {};
  return new Set(Object.keys(countryFAQ) as AssistantIntent[]);
}

/**
 * Returns true if the given country has a FAQ entry for the given intent.
 *
 * @param countryCode - ISO 3166-1 alpha-2 code (case-insensitive)
 * @param intent - The intent to check
 */
export function hasIntentCoverage(
  countryCode: string,
  intent: AssistantIntent,
): boolean {
  return getCoveredIntents(countryCode).has(intent);
}
