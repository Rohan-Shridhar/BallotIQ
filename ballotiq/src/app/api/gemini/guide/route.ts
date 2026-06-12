/**
 * API Route: POST /api/gemini/guide
 * Generates a personalized election guide server-side using Gemini.
 * The GEMINI_API_KEY is never exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedGuide } from '@/lib/gemini/guide';
import type { KnowledgeLevel } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      countryCode: string;
      countryName: string;
      knowledgeLevel: KnowledgeLevel;
      focusAreas: string[];
      userConfusion: string;
      sessionId?: string;
      stepCount?: number;
    };

    const {
      countryCode, countryName, knowledgeLevel,
      focusAreas, userConfusion, sessionId, stepCount,
    } = body;

    if (!countryCode || !countryName || !knowledgeLevel || !focusAreas || userConfusion === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const result = await generatePersonalizedGuide(
      countryCode, countryName, knowledgeLevel,
      focusAreas, userConfusion, sessionId, stepCount,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /gemini/guide] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
