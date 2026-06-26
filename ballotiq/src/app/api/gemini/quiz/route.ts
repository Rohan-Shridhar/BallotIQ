/**
 * API Route: POST /api/gemini/quiz
 * Generates a personalized final quiz server-side using Gemini.
 * The GEMINI_API_KEY is never exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedQuiz } from '@/lib/gemini/quiz';
import type { ElectionStep, KnowledgeLevel } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      completedSteps: ElectionStep[];
      knowledgeLevel: KnowledgeLevel;
      countryCode: string;
      sessionId?: string;
    };

    const { completedSteps, knowledgeLevel, countryCode, sessionId } = body;

    if (!completedSteps || !knowledgeLevel || !countryCode) {
      return NextResponse.json(
        { error: 'Missing required fields: completedSteps, knowledgeLevel, countryCode' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const questions = await generatePersonalizedQuiz(
      completedSteps, knowledgeLevel, countryCode, sessionId,
    );
    return NextResponse.json(questions);
  } catch (error) {
    console.error('[API /gemini/quiz] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
