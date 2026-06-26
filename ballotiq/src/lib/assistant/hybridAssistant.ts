/**
 * Hybrid Assistant Engine.
 * Routes user queries between the static FAQ engine (fast, zero cost, reliable)
 * and the Gemini AI (smart, conversational, depth-aware).
 *
 * Routing order:
 *  0. Scope guard — off-topic or cross-country questions are rejected early.
 *  1. FAQ engine — instant, zero-cost, used when confidence ≥ CONFIDENCE_THRESHOLD.
 *  2. Gemini AI  — used for high-quality answers when FAQ has no coverage or
 *                  when intent confidence is below the threshold.
 *                  The detected intent (if any) is forwarded as a prompt hint.
 *  3. Generic fallback — last resort when AI is disabled or unavailable.
 *
 * After every routing decision a lightweight telemetry event is written to
 * Firestore asynchronously so quota usage can be monitored over time.
 */

import { detectIntentWithConfidence, CONFIDENCE_THRESHOLD } from './intentEngine';
import { getFAQResponse } from './faqDatabase';
import { askAssistant } from '@/lib/gemini/assistant';
import { writeRoutingEvent } from '@/lib/firebase/firestore/telemetry';
import type { ChatMessage, ElectionStep, UserContext } from '@/types';
import { logger } from '@/lib/logger';
import { COUNTRIES, getCountryByCode } from '@/lib/constants/countries';
import type { AssistantIntent } from './intentEngine';

export interface AssistantResponse {
  content: string;
  source: 'ai' | 'faq' | 'fallback' | 'error';
  officialSource?: { name: string; url: string };
  suggestedQuestions?: string[];
}

/**
 * Orchestrates the best response for the user based on context and intent.
 * This is the main entry point for the assistant UI.
 */
export async function getAssistantResponse(
  question: string,
  userContext: UserContext,
  completedSteps: ElectionStep[],
  chatHistory: ChatMessage[],
  aiEnabled: boolean = true,
): Promise<AssistantResponse> {
  const normalizedQuestion = question.trim().toLowerCase();
  const { intent, confidence } = detectIntentWithConfidence(question);
  const countryData = getCountryByCode(userContext.countryCode);
  const officialName =
    countryData?.electionBody ||
    userContext.electionBody ||
    userContext.countryName + ' Election Body';
  const officialUrl =
    countryData?.electionBodyUrl ||
    userContext.electionBodyUrl ||
    `https://www.google.com/search?q=${encodeURIComponent(
      userContext.countryName + ' official election website',
    )}`;

  // 0. Contextual Scope Guard
  const isOnTopic = isAllowedTopic(normalizedQuestion, chatHistory.length > 0);
  if (!isOnTopic) {
    void writeRoutingEvent({
      countryCode: userContext.countryCode,
      intent,
      confidence,
      routedTo: 'fallback',
      sessionId: userContext.sessionId,
    });
    return {
      content: `I can only help with elections, voting, and civic politics. I am not built for unrelated topics. You can ask about voter registration, eligibility, election dates, polling stations, voting process, election rules, political systems, or how elections work in ${userContext.countryName}.`,
      source: 'fallback',
      officialSource: { name: officialName, url: officialUrl },
    };
  }

  const mentionedCountry = detectMentionedCountry(normalizedQuestion);
  if (
    mentionedCountry &&
    mentionedCountry.code !== userContext.countryCode.toUpperCase()
  ) {
    void writeRoutingEvent({
      countryCode: userContext.countryCode,
      intent,
      confidence,
      routedTo: 'fallback',
      sessionId: userContext.sessionId,
    });
    return {
      content: `Your current assistant is configured for ${userContext.countryName}. I cannot answer election process questions for ${mentionedCountry.name} in this session. Please switch country from the home page and then ask again.`,
      source: 'fallback',
      officialSource: { name: officialName, url: officialUrl },
    };
  }

  // 1. FAQ Engine — only when confidence meets the threshold
  if (intent !== 'unknown' && confidence >= CONFIDENCE_THRESHOLD) {
    const faq = getFAQResponse(
      userContext.countryCode,
      intent,
      userContext.knowledgeLevel,
    );
    if (faq) {
      logger.info('Assistant routing: FAQ matched', {
        intent,
        confidence,
        country: userContext.countryCode,
      });
      void writeRoutingEvent({
        countryCode: userContext.countryCode,
        intent,
        confidence,
        routedTo: 'faq',
        sessionId: userContext.sessionId,
      });
      return {
        content: faq.answer,
        source: 'faq',
        officialSource: { name: faq.sourceName, url: faq.sourceUrl },
        suggestedQuestions: faq.followUps,
      };
    }
  }

  // 2. Gemini AI
  if (aiEnabled) {
    try {
      // Pass the detected intent (even low-confidence) as a hint to Gemini so
      // it can focus its answer even when the FAQ has no coverage.
      const intentHint: AssistantIntent | undefined =
        intent !== 'unknown' ? intent : undefined;
      const aiContent = await askAssistant(
        question,
        userContext,
        completedSteps,
        chatHistory,
        intentHint,
      );
      if (aiContent) {
        logger.info('Assistant routing: AI generated', { intent, confidence });
        void writeRoutingEvent({
          countryCode: userContext.countryCode,
          intent,
          confidence,
          routedTo: 'ai',
          sessionId: userContext.sessionId,
        });
        return {
          content: aiContent,
          source: 'ai',
          officialSource: { name: officialName, url: officialUrl },
        };
      }
    } catch (err) {
      logger.error('Assistant routing: AI failed', err, {
        component: 'HybridAssistant',
      });
    }
  }

  // 3. Final Fallback
  void writeRoutingEvent({
    countryCode: userContext.countryCode,
    intent,
    confidence,
    routedTo: 'fallback',
    sessionId: userContext.sessionId,
  });
  return {
    content:
      "I'm sorry, I couldn't find a specific answer for that. As a non-partisan guide, I recommend checking the official election commission website for the most accurate and up-to-date information.",
    source: 'fallback',
    officialSource: { name: officialName, url: officialUrl },
  };
}

function isAllowedTopic(question: string, hasHistory: boolean): boolean {
  const followUpKeywords = [
    'continue', 'more', 'elaborate', 'why', 'how', 'explain', 'tell me', 'next', 'back', 'previous',
    'yes', 'no', 'sure', 'okay', 'thanks', 'thank you', 'please', 'details',
  ];

  const civicKeywords = [
    'election', 'elections', 'vote', 'voting', 'voter', 'ballot', 'booth', 'poll', 'polling',
    'constituency', 'candidate', 'campaign', 'manifesto', 'democracy', 'parliament', 'assembly',
    'president', 'prime minister', 'senate', 'congress', 'governor', 'mayor', 'municipal',
    'registration', 'electoral roll', 'epic', 'evm', 'vvpat', 'commission', 'politic', 'policy',
    'government', 'governance', 'public office', 'party', 'coalition', 'ideology', 'civic',
    'representative', 'legislature', 'judiciary', 'executive', 'constitution', 'amendment',
    'right', 'duty', 'citizen', 'participation', 'polling station', 'counting', 'result',
    'document', 'documents', 'id', 'identification', 'proof', 'card', 'take', 'bring',
  ];

  if (civicKeywords.some((k) => question.includes(k))) return true;

  if (hasHistory) {
    return followUpKeywords.some((k) => new RegExp(`\\b${k}\\b`, 'i').test(question));
  }

  return false;
}

function detectMentionedCountry(
  question: string,
): { code: string; name: string } | null {
  const matched = COUNTRIES.find((country) =>
    question.includes(country.name.toLowerCase()),
  );
  return matched ? { code: matched.code, name: matched.name } : null;
}
