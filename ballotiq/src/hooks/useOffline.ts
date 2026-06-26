"use client";

import { useState, useEffect } from 'react';
import { captureEvent } from '@/lib/posthog/helper';
import { EVENTS } from '@/lib/posthog/events';

/**
 * Hook to track the online/offline status of the browser.
 */
export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      captureEvent(EVENTS.OFFLINE_STATUS_CHANGED, { is_offline: false });
      setIsOffline(false);
    };
    const handleOffline = () => {
      captureEvent(EVENTS.OFFLINE_STATUS_CHANGED, { is_offline: true });
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
