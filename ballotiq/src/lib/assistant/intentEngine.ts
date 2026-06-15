/**
 * Lightweight intent detection engine.
 * Maps user queries to specific election topics without using AI tokens.
 *
 * Each intent has weighted keywords — higher weight means a stronger signal.
 * Confidence is normalised to [0, 1] and capped at 1.0.
 * Only intents with confidence >= CONFIDENCE_THRESHOLD are returned; below
 * that the result falls back to 'unknown' so the hybrid assistant can route
 * to Gemini with the detected intent as a prompt hint instead.
 */

export type AssistantIntent =
  | 'voter_registration'
  | 'voting_process'
  | 'id_requirements'
  | 'election_dates'
  | 'results_counting'
  | 'eligibility'
  | 'unknown';

/** Minimum confidence score required to trust an intent match (0–1). */
export const CONFIDENCE_THRESHOLD = 0.7;

/** A keyword entry with an optional weight multiplier (default weight = 1). */
interface WeightedKeyword {
  keyword: string;
  weight: number;
}

/**
 * Normalisation denominator per intent — the maximum achievable raw score.
 * Set to the sum of the top-3 weights for that intent so that hitting three
 * strong signals yields confidence ~1.0.
 */
const INTENT_NORMALISER: Record<Exclude<AssistantIntent, 'unknown'>, number> = {
  voter_registration: 6,   // e.g. "register" (3) + "form 6" (2) + "electoral roll" (1)
  voting_process: 6,
  id_requirements: 5,
  election_dates: 5,
  results_counting: 5,
  eligibility: 5,
};

const INTENT_KEYWORDS: Record<Exclude<AssistantIntent, 'unknown'>, WeightedKeyword[]> = {
  voter_registration: [
    { keyword: 'register to vote', weight: 3 },
    { keyword: 'voter registration', weight: 3 },
    { keyword: 'register', weight: 2 },
    { keyword: 'registration', weight: 2 },
    { keyword: 'form 6', weight: 2 },
    { keyword: 'enroll', weight: 2 },
    { keyword: 'sign up to vote', weight: 2 },
    { keyword: 'electoral roll', weight: 1 },
    { keyword: 'voter list', weight: 1 },
    { keyword: 'voter id card', weight: 1 },
    { keyword: 'nvsp', weight: 1 },
    { keyword: 'sign up', weight: 1 },
    { keyword: 'list', weight: 0.5 },
  ],
  voting_process: [
    { keyword: 'how to vote', weight: 3 },
    { keyword: 'casting vote', weight: 3 },
    { keyword: 'polling station', weight: 2 },
    { keyword: 'evm', weight: 2 },
    { keyword: 'voting machine', weight: 2 },
    { keyword: 'ballot', weight: 2 },
    { keyword: 'vvpat', weight: 2 },
    { keyword: 'booth', weight: 1 },
    { keyword: 'vote', weight: 1 },
    { keyword: 'machine', weight: 0.5 },
  ],
  id_requirements: [
    { keyword: 'what documents', weight: 3 },
    { keyword: 'documents needed', weight: 3 },
    { keyword: 'id required', weight: 3 },
    { keyword: 'identification', weight: 2 },
    { keyword: 'voter card', weight: 2 },
    { keyword: 'aadhaar', weight: 2 },
    { keyword: 'passport', weight: 2 },
    { keyword: 'epic', weight: 2 },
    { keyword: 'proof of', weight: 1 },
    { keyword: 'document', weight: 1 },
    { keyword: 'id', weight: 0.5 },
  ],
  election_dates: [
    { keyword: 'when is the election', weight: 3 },
    { keyword: 'election date', weight: 3 },
    { keyword: 'polling day', weight: 2 },
    { keyword: 'election schedule', weight: 2 },
    { keyword: 'deadline', weight: 2 },
    { keyword: 'timeline', weight: 1 },
    { keyword: 'schedule', weight: 1 },
    { keyword: 'when', weight: 0.5 },
    { keyword: 'date', weight: 0.5 },
  ],
  results_counting: [
    { keyword: 'counting day', weight: 3 },
    { keyword: 'election results', weight: 3 },
    { keyword: 'vote counting', weight: 3 },
    { keyword: 'who won', weight: 2 },
    { keyword: 'winner', weight: 2 },
    { keyword: 'results', weight: 1 },
    { keyword: 'count', weight: 1 },
    { keyword: 'tally', weight: 1 },
  ],
  eligibility: [
    { keyword: 'am i eligible', weight: 3 },
    { keyword: 'can i vote', weight: 3 },
    { keyword: 'voting age', weight: 3 },
    { keyword: 'eligible to vote', weight: 3 },
    { keyword: 'eligibility', weight: 2 },
    { keyword: 'citizen', weight: 1 },
    { keyword: 'age', weight: 0.5 },
    { keyword: 'eligible', weight: 1 },
    { keyword: 'requirements', weight: 0.5 },
  ],
};

/** Result returned by `detectIntentWithConfidence`. */
export interface IntentDetectionResult {
  intent: AssistantIntent;
  confidence: number;
}

/**
 * Scores a message against all intents using weighted keyword matching.
 * Returns the highest-scoring intent along with its normalised confidence (0–1).
 * If the best score is below CONFIDENCE_THRESHOLD the intent is 'unknown'.
 *
 * @param message - Raw user input string
 * @returns IntentDetectionResult with intent and confidence
 */
export function detectIntentWithConfidence(message: string): IntentDetectionResult {
  const text = message.toLowerCase();
  let bestIntent: Exclude<AssistantIntent, 'unknown'> | null = null;
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [
    Exclude<AssistantIntent, 'unknown'>,
    WeightedKeyword[],
  ][]) {
    let raw = 0;
    for (const { keyword, weight } of keywords) {
      if (text.includes(keyword)) {
        raw += weight;
      }
    }
    if (raw > bestScore) {
      bestScore = raw;
      bestIntent = intent;
    }
  }

  if (!bestIntent || bestScore === 0) {
    return { intent: 'unknown', confidence: 0 };
  }

  const normaliser = INTENT_NORMALISER[bestIntent];
  const confidence = Math.min(bestScore / normaliser, 1.0);

  if (confidence < CONFIDENCE_THRESHOLD) {
    // Return the detected intent AND confidence so callers can use it as a
    // Gemini prompt hint, but signal that it should not short-circuit to FAQ.
    return { intent: bestIntent, confidence };
  }

  return { intent: bestIntent, confidence };
}

/**
 * Backwards-compatible wrapper — returns only the intent string.
 * Use `detectIntentWithConfidence` for new code.
 *
 * @param message - Raw user input
 * @returns AssistantIntent (returns 'unknown' for low-confidence matches)
 */
export function detectIntent(message: string): AssistantIntent {
  const { intent, confidence } = detectIntentWithConfidence(message);
  return confidence >= CONFIDENCE_THRESHOLD ? intent : 'unknown';
}
