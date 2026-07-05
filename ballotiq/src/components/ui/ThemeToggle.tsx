'use client';

import { Sun, Moon, Monitor, Contrast } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';
import { captureEvent } from '@/lib/posthog/helper';
import { EVENTS } from '@/lib/posthog/events';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by rendering a placeholder or disabled state until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get icon based on current theme
  const getThemeIcon = () => {
    if (theme === 'contrast') {
      return <Contrast className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" aria-hidden="true" />;
    }
    if (theme === 'system') {
      return <Monitor className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-400" aria-hidden="true" />;
    }
    return theme === 'dark' ? (
      <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-400" aria-hidden="true" />
    ) : (
      <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-500" aria-hidden="true" />
    );
  };

  // Get aria-label based on current theme
  const getAriaLabel = () => {
    if (theme === 'contrast') {
      return 'Switch to dark mode';
    }
    if (theme === 'system') {
      return 'Switch to contrast mode';
    }
    return theme === 'dark' 
      ? 'Switch to light theme' 
      : 'Switch to dark theme';
  };

  // Get title based on current theme - safe version without window
  const getTitle = () => {
    if (theme === 'contrast') {
      return 'High Contrast Mode - Click to cycle';
    }
    if (theme === 'system') {
      return 'System theme (follows OS preference) - Click to cycle';
    }
    return theme === 'dark' 
      ? 'Switch to light theme' 
      : 'Switch to dark theme';
  };

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
      onClick={() => {
        // Cycle: Dark → Light → System → Contrast → Dark
        const nextTheme = 
          theme === 'dark' ? 'light' :
          theme === 'light' ? 'system' :
          theme === 'system' ? 'contrast' :
          'dark';
        captureEvent(EVENTS.THEME_TOGGLED, { new_theme: nextTheme });
        setTheme(nextTheme);
      }}
      aria-label={getAriaLabel()}
      title={getTitle()}
      className={`cursor-pointer flex items-center justify-center w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-xl
        bg-white/5 border border-white/10 text-gray-200
        hover:bg-white/10 hover:border-blue-500/30
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        transition-all duration-300 relative ${className}`}
    >
      {getThemeIcon()}
      
      {/* Visual indicator for system mode - small dot */}
      {theme === 'system' && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
      )}
      
      {/* Visual indicator for contrast mode - small ring */}
      {theme === 'contrast' && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full" />
      )}
    </button>
  );
}