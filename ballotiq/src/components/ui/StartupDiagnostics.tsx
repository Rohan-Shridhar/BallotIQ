'use client';

import { useEffect } from 'react';

/** One-time diagnostic check for Gemini connection on application startup. */
export default function StartupDiagnostics() {
  useEffect(() => {
    // Check AI availability via server-side API (keeps API key out of the bundle)
    fetch('/api/gemini/status').catch(() => {
      // Silently ignore — this is a non-critical startup diagnostic
    });
  }, []);

  return null;
}
