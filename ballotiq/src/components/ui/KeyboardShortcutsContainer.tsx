'use client';

import { useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

export default function KeyboardShortcutsContainer() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts({
    onToggleHelp: () => setIsOpen((prev) => !prev),
    onClose: () => setIsOpen(false),
    isOpen,
  });

  return (
    <KeyboardShortcutsModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}
