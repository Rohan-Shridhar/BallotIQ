/**
 * API Route: POST /api/gemini/assistant
 * Routes user questions through the hybrid assistant engine server-side.
 * The GEMINI_API_KEY is never exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAssistantResponse } from '@/lib/assistant/hybridAssistant';
import type { ChatMessage, ElectionStep, UserContext } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      question: string;
      userContext: UserContext;
      completedSteps: ElectionStep[];
      chatHistory: ChatMessage[];
    };

    const { question, userContext, completedSteps, chatHistory } = body;

    if (!question || !userContext || !completedSteps || !chatHistory) {
      return NextResponse.json(
        { error: 'Missing required fields: question, userContext, completedSteps, chatHistory' },
        { status: 400 }
      );
    }

    // The hybridAssistant routes to FAQ (no API key needed) or Gemini (server env only)
    const result = await getAssistantResponse(
      question, userContext, completedSteps, chatHistory,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /gemini/assistant] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
