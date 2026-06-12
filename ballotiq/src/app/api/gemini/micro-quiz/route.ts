/**
 * API Route: POST /api/gemini/micro-quiz
 * Generates a micro-quiz question server-side using Gemini.
 * The GEMINI_API_KEY is never exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMicroQuiz } from '@/lib/gemini/quiz';
import type { ElectionStep, KnowledgeLevel } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      step: ElectionStep;
      knowledgeLevel: KnowledgeLevel;
      sessionId?: string;
    };

    const { step, knowledgeLevel, sessionId } = body;

    if (!step || !knowledgeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: step, knowledgeLevel' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const result = await generateMicroQuiz(step, knowledgeLevel, sessionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /gemini/micro-quiz] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
