/**
 * Tests for the intent detection engine with confidence scoring.
 */

import {
  detectIntent,
  detectIntentWithConfidence,
  CONFIDENCE_THRESHOLD,
} from '@/lib/assistant/intentEngine';

describe('detectIntentWithConfidence', () => {
  it('returns voter_registration with high confidence for a clear registration query', () => {
    const result = detectIntentWithConfidence('How do I register to vote?');
    expect(result.intent).toBe('voter_registration');
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
  });

  it('returns voting_process with high confidence for an EVM question', () => {
    const result = detectIntentWithConfidence('How does the EVM voting machine work?');
    expect(result.intent).toBe('voting_process');
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
  });

  it('returns eligibility with high confidence for an age question', () => {
    const result = detectIntentWithConfidence('What is the voting age to be eligible to vote?');
    expect(result.intent).toBe('eligibility');
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
  });

  it('returns election_dates with high confidence for a date question', () => {
    const result = detectIntentWithConfidence('When is the election date and polling day?');
    expect(result.intent).toBe('election_dates');
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
  });

  it('returns id_requirements with high confidence for a documents question', () => {
    const result = detectIntentWithConfidence('What documents do I need for voter identification?');
    expect(result.intent).toBe('id_requirements');
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
  });

  it('returns results_counting with high confidence for a counting question', () => {
    const result = detectIntentWithConfidence('When is counting day and how are election results announced?');
    expect(result.intent).toBe('results_counting');
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
  });

  it('returns unknown with zero confidence for a completely off-topic query', () => {
    const result = detectIntentWithConfidence('What is the weather today?');
    expect(result.intent).toBe('unknown');
    expect(result.confidence).toBe(0);
  });

  it('returns low confidence and the best-guess intent for weak signals', () => {
    // 'age' alone has weight 0.5, below the threshold
    const result = detectIntentWithConfidence('age');
    expect(result.confidence).toBeLessThan(CONFIDENCE_THRESHOLD);
  });

  it('confidence is normalised and never exceeds 1.0', () => {
    // Pile on many registration keywords
    const result = detectIntentWithConfidence(
      'voter registration register to vote form 6 electoral roll sign up to vote nvsp enroll',
    );
    expect(result.confidence).toBeLessThanOrEqual(1.0);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });

  it('does NOT produce false-positive registration from a negative statement', () => {
    // "I don't want to be a voter" should not reach high confidence for registration
    const result = detectIntentWithConfidence("I don't care about registration at all");
    // It may detect voter_registration from the keyword 'registration', but confidence
    // should be low because there is only one weak signal
    if (result.intent === 'voter_registration') {
      expect(result.confidence).toBeLessThan(CONFIDENCE_THRESHOLD);
    }
  });
});

describe('detectIntent (backwards-compatible wrapper)', () => {
  it('returns the intent when confidence is at or above the threshold', () => {
    expect(detectIntent('How do I register to vote?')).toBe('voter_registration');
  });

  it('returns unknown when confidence is below the threshold', () => {
    // Single weak keyword — should fall back to unknown
    expect(detectIntent('age')).toBe('unknown');
  });

  it('returns unknown for empty string', () => {
    expect(detectIntent('')).toBe('unknown');
  });
});
