/**
 * API Route: POST /api/gemini/assess
 * Analyzes user's assessment answers server-side using Gemini.
 * The GEMINI_API_KEY is never exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeAssessment } from '@/lib/gemini/assessment';
import type { AssessmentAnswer } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      answers: AssessmentAnswer;
      countryCode: string;
      countryName: string;
    };

    const { answers, countryCode, countryName } = body;

    if (!answers || !countryCode || !countryName) {
      return NextResponse.json(
        { error: 'Missing required fields: answers, countryCode, countryName' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const result = await analyzeAssessment(answers, countryCode, countryName);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /gemini/assess] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
