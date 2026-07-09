/**
 * API Route: POST /api/gemini/re-explain
 * Re-explains a concept when the user answers a micro-quiz incorrectly.
 * Runs server-side using Gemini. The GEMINI_API_KEY is never exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/security/auth';
import { reExplainConcept } from '@/lib/gemini/assistant';
import type { ElectionStep, KnowledgeLevel } from '@/types';

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json() as {
      step: ElectionStep;
      userAnswer: string;
      correctAnswer: string;
      knowledgeLevel: KnowledgeLevel;
      sessionId?: string;
    };

    const { step, userAnswer, correctAnswer, knowledgeLevel, sessionId } = body;

    if (!step || userAnswer === undefined || !correctAnswer || !knowledgeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: step, userAnswer, correctAnswer, knowledgeLevel' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const explanation = await reExplainConcept(
      step, userAnswer, correctAnswer, knowledgeLevel, sessionId,
    );
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('[API /gemini/re-explain] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
