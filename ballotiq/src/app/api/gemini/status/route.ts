/**
 * API Route: GET /api/gemini/status
 * Returns whether the Gemini AI service is properly configured.
 * Safe to call from client components.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const enabled = Boolean(process.env.GEMINI_API_KEY) && process.env.GEMINI_API_KEY!.length > 5;
  return NextResponse.json({ enabled });
}
