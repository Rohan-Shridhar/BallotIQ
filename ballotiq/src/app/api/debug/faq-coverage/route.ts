/**
 * Dev-only API Route: GET /api/debug/faq-coverage
 *
 * Returns the FAQ coverage report produced by coverageMap.ts so developers
 * can quickly identify which countries are missing required intent coverage
 * without running the test suite.
 *
 * This route is DISABLED in production (NODE_ENV === 'production').
 */

import { NextResponse } from 'next/server';
import { getCoverageReport } from '@/lib/assistant/coverageMap';

export async function GET(): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const report = getCoverageReport();
  return NextResponse.json(report, { status: 200 });
}
