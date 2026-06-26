'use client';

import { useEffect, useRef } from 'react';
import { X, HelpCircle } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save the element that was focused before opening the modal
    const previousActiveElement = document.activeElement as HTMLElement;

    // Query all focusable elements inside the modal
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = Array.from(modal.querySelectorAll<HTMLElement>(focusableElementsString));
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Focus the first focusable element
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['?'], action: 'Open/close this help menu' },
    { keys: ['Ctrl', 'Enter'], action: 'Submit answer (assessment Q3)' },
    { keys: ['Enter'], action: 'Send chat message' },
    { keys: ['Esc'], action: 'Close modals / dismiss suggestions' },
    { keys: ['Tab'], action: 'Navigate between interactive elements' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        aria-describedby="keyboard-shortcuts-description"
        className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 animate-in zoom-in duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2
                id="keyboard-shortcuts-title"
                className="text-xl font-black text-gray-900 dark:text-white leading-tight"
              >
                <TranslatedText text="Keyboard Shortcuts" />
              </h2>
              <p
                id="keyboard-shortcuts-description"
                className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
              >
                <TranslatedText text="Use these shortcuts to navigate faster" />
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List / Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <TranslatedText text="Shortcut" />
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <TranslatedText text="Action" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {shortcuts.map((shortcut, index) => (
                <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          {keyIndex > 0 && <span className="text-xs text-gray-400 font-medium">+</span>}
                          <kbd className="px-2 py-1 text-xs font-mono font-bold bg-gray-100 dark:bg-white/10 border border-gray-300/80 dark:border-white/20 rounded-md shadow-sm text-gray-800 dark:text-gray-200">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                    <TranslatedText text={shortcut.action} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-xs tracking-wider uppercase focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
          >
            <TranslatedText text="Got it" />
          </button>
        </div>
      </div>
    </div>
  );
}
