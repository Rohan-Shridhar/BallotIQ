'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by rendering a placeholder or disabled state until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-xl bg-white/5 border border-white/10 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`cursor-pointer flex items-center justify-center w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-xl
        bg-white/5 border border-white/10 text-gray-200
        hover:bg-white/10 hover:border-blue-500/30
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        transition-all duration-300 ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-400" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-500" aria-hidden="true" />
      )}
    </button>
  );
}
