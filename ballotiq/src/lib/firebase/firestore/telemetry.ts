/**
 * Firestore Telemetry — Assistant Routing Events.
 *
 * Writes a lightweight event to the `assistant_routing` collection every time
 * the hybrid assistant makes a routing decision (FAQ / AI / fallback).
 *
 * Security model:
 *  - The collection is write-only from the client via anonymous auth.
 *  - Each document is scoped to the session that produced it.
 *  - Reads are blocked by the Firestore security rules — this is append-only
 *    observability data, not user data.
 *
 * The write is fire-and-forget (non-blocking). Failures are silently swallowed
 * so a Firestore hiccup never degrades the assistant response.
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDB, authReady } from '../client';
import { logger } from '@/lib/logger';
import type { AssistantIntent } from '@/lib/assistant/intentEngine';

/** Routing destinations that can be recorded. */
export type RoutingDestination = 'faq' | 'ai' | 'fallback';

/** Payload written to Firestore for each routing decision. */
export interface RoutingEventPayload {
  /** ISO 3166-1 alpha-2 country code for the session. */
  countryCode: string;
  /** Detected intent (may be 'unknown' for unrecognised queries). */
  intent: AssistantIntent;
  /** Normalised confidence score from the intent engine (0–1). */
  confidence: number;
  /** Where the query was ultimately routed. */
  routedTo: RoutingDestination;
  /** Session identifier — scopes the event to an anonymous user. */
  sessionId: string;
}

/**
 * Writes a routing telemetry event to Firestore asynchronously.
 * Always resolves — never rejects — so callers can safely use `void`.
 *
 * @param payload - The routing event data to record
 */
export async function writeRoutingEvent(
  payload: RoutingEventPayload,
): Promise<void> {
  try {
    await authReady;
    const db = getFirestoreDB();
    if (!db) return;

    const ref = collection(db, 'assistant_routing');
    await addDoc(ref, {
      ...payload,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    // Non-critical — log only, never surface to the user.
    logger.error('[Telemetry] Failed to write routing event:', error, {
      component: 'RoutingTelemetry',
    });
  }
}
