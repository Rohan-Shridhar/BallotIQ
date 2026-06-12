/**
 * API Route: POST /api/gemini/insight
 * Generates a post-quiz performance insight server-side using Gemini.
 * The GEMINI_API_KEY is never exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePerformanceInsight } from '@/lib/gemini/quiz';
import type { KnowledgeLevel, QuizQuestion, QuizResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      results: QuizResult[];
      questions: QuizQuestion[];
      knowledgeLevel: KnowledgeLevel;
      countryCode: string;
      sessionId?: string;
    };

    const { results, questions, knowledgeLevel, countryCode, sessionId } = body;

    if (!results || !questions || !knowledgeLevel || !countryCode) {
      return NextResponse.json(
        { error: 'Missing required fields: results, questions, knowledgeLevel, countryCode' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const insight = await generatePerformanceInsight(
      results, questions, knowledgeLevel, countryCode, sessionId,
    );
    return NextResponse.json({ insight });
  } catch (error) {
    console.error('[API /gemini/insight] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
