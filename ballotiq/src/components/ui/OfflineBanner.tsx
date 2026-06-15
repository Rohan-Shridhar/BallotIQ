"use client";

import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
  const isOffline = useOffline();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-3 shadow-lg"
        >
          <WifiOff className="w-5 h-5" />
          <div className="text-sm font-medium">
            You are currently offline. Using cached data for previously viewed election guides.
          </div>
          <div className="hidden md:flex items-center gap-1 text-[10px] uppercase tracking-wider bg-amber-600/20 px-2 py-0.5 rounded border border-amber-600/30">
            <AlertTriangle className="w-3 h-3" />
            Offline Mode Active
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
