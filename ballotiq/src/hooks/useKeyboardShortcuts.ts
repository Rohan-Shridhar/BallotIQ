'use client';

import { useEffect } from 'react';
import { captureEvent } from '@/lib/posthog/helper';
import { EVENTS } from '@/lib/posthog/events';

interface UseKeyboardShortcutsProps {
  onToggleHelp: () => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Global keyboard shortcuts hook.
 * Listens for '?' key to open/close shortcuts help modal.
 * Esc closes the modal.
 * Also listens for a custom 'toggle-keyboard-shortcuts' event to trigger on mobile/clicks.
 */
export function useKeyboardShortcuts({
  onToggleHelp,
  onClose,
  isOpen,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        const isContentEditable = target.isContentEditable;
        if (
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          isContentEditable
        ) {
          return;
        }
      }

      if (event.key === '?') {
        event.preventDefault();
        captureEvent(EVENTS.KEYBOARD_SHORTCUT_USED, { key: '?' });
        onToggleHelp();
      } else if (event.key === 'Escape' || event.key === 'Esc') {
        if (isOpen) {
          event.preventDefault();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const handleCustomToggle = () => {
      onToggleHelp();
    };

    window.addEventListener('toggle-keyboard-shortcuts', handleCustomToggle);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-keyboard-shortcuts', handleCustomToggle);
    };
  }, [onToggleHelp, onClose, isOpen]);
}
