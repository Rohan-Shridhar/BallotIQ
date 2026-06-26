/**
 * FAQ Coverage Map tests — including the CI gate that fails when a supported
 * country is missing required intent coverage.
 */

import { COUNTRIES } from '@/lib/constants/countries';
import { MINIMUM_REQUIRED_INTENTS } from '@/lib/assistant/faqDatabase';
import {
  getCoverageReport,
  getCoveredIntents,
  hasIntentCoverage,
} from '@/lib/assistant/coverageMap';

// ---------------------------------------------------------------------------
// Coverage gate — this is the CI-blocking test
// ---------------------------------------------------------------------------

describe('FAQ Coverage Gate', () => {
  /**
   * This test intentionally fails CI when a new country is added to COUNTRIES
   * without corresponding FAQ entries for the MINIMUM_REQUIRED_INTENTS.
   *
   * To fix a failure here, add the missing intent entries to faqDatabase.ts.
   */
  it('every supported country has all required intent entries in the FAQ database', () => {
    const report = getCoverageReport();

    const failures = report.countries.filter((c) => !c.fullyRequired);

    if (failures.length > 0) {
      const message = failures
        .map(
          (c) =>
            `${c.countryName} (${c.countryCode}) is missing: ${c.missingRequiredIntents.join(', ')}`,
        )
        .join('\n');
      throw new Error(
        `FAQ coverage gate failed — add entries to faqDatabase.ts:\n${message}`,
      );
    }

    expect(failures).toHaveLength(0);
  });

  it('the report covers exactly the same countries as the COUNTRIES constant', () => {
    const report = getCoverageReport();
    const reportCodes = report.countries.map((c) => c.countryCode).sort();
    const countryCodes = COUNTRIES.map((c) => c.code).sort();
    expect(reportCodes).toEqual(countryCodes);
  });

  it('generatedAt is a valid ISO timestamp', () => {
    const report = getCoverageReport();
    expect(() => new Date(report.generatedAt)).not.toThrow();
    expect(new Date(report.generatedAt).toISOString()).toBe(report.generatedAt);
  });
});

// ---------------------------------------------------------------------------
// getCoverageReport
// ---------------------------------------------------------------------------

describe('getCoverageReport', () => {
  it('returns allRequiredCovered: true when all countries pass', () => {
    const report = getCoverageReport();
    // This will only pass if the coverage gate above passes — intentional coupling.
    expect(report.allRequiredCovered).toBe(true);
  });

  it('each country entry lists its covered intents', () => {
    const report = getCoverageReport();
    for (const country of report.countries) {
      expect(Array.isArray(country.coveredIntents)).toBe(true);
      expect(Array.isArray(country.missingRequiredIntents)).toBe(true);
    }
  });

  it('is synchronous — returns a value, not a Promise', () => {
    const result = getCoverageReport();
    // If it were a Promise, .countries would be undefined
    expect(result.countries).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// getCoveredIntents
// ---------------------------------------------------------------------------

describe('getCoveredIntents', () => {
  it('returns a Set containing voter_registration for India', () => {
    const intents = getCoveredIntents('IN');
    expect(intents.has('voter_registration')).toBe(true);
  });

  it('is case-insensitive', () => {
    const upper = getCoveredIntents('US');
    const lower = getCoveredIntents('us');
    expect(upper).toEqual(lower);
  });

  it('returns an empty Set for an unsupported country code', () => {
    const intents = getCoveredIntents('XX');
    expect(intents.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// hasIntentCoverage
// ---------------------------------------------------------------------------

describe('hasIntentCoverage', () => {
  it('returns true when India has voter_registration coverage', () => {
    expect(hasIntentCoverage('IN', 'voter_registration')).toBe(true);
  });

  it('returns true when US has eligibility coverage', () => {
    expect(hasIntentCoverage('US', 'eligibility')).toBe(true);
  });

  it('returns false for an unsupported country', () => {
    expect(hasIntentCoverage('XX', 'voter_registration')).toBe(false);
  });

  it('returns false for an intent with no FAQ entry even in a supported country', () => {
    // 'unknown' is never a FAQ key, should always be false
    expect(hasIntentCoverage('IN', 'unknown')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MINIMUM_REQUIRED_INTENTS sanity check
// ---------------------------------------------------------------------------

describe('MINIMUM_REQUIRED_INTENTS', () => {
  it('contains at least voter_registration, voting_process, and eligibility', () => {
    expect(MINIMUM_REQUIRED_INTENTS).toContain('voter_registration');
    expect(MINIMUM_REQUIRED_INTENTS).toContain('voting_process');
    expect(MINIMUM_REQUIRED_INTENTS).toContain('eligibility');
  });

  it('does not contain unknown', () => {
    expect(MINIMUM_REQUIRED_INTENTS).not.toContain('unknown');
  });
});
