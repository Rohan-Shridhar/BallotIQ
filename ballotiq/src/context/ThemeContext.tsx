'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light' | 'system' | 'contrast';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('ballotiq_theme') as Theme;
    return saved === 'light' ||
           saved === 'dark' ||
           saved === 'system' ||
           saved === 'contrast'
      ? saved
      : 'system';
  });

  const getSystemTheme = useCallback((): 'dark' | 'light' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    
    // Handle contrast mode separately
    let resolvedTheme: 'dark' | 'light' | 'contrast';
    
    if (newTheme === 'contrast') {
      resolvedTheme = 'contrast';
    } else if (newTheme === 'system') {
      resolvedTheme = getSystemTheme();
    } else {
      resolvedTheme = newTheme;
    }
    
    const root = window.document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('dark', 'light', 'contrast');
    
    // Add the resolved theme class
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
    
    localStorage.setItem('ballotiq_theme', newTheme);
    setThemeState(newTheme);
    
    // Dispatch custom event for theme changes
    // This allows other components to react to theme changes
    window.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: newTheme,
      })
    );
  }, [getSystemTheme]);

  // STEP 2.2 - INITIAL LOAD FLASH FIX (FOUC) with contrast support
  useEffect(() => {
    const saved = localStorage.getItem('ballotiq_theme') as Theme;
    
    const initialTheme =
      saved === 'light' ||
      saved === 'dark' ||
      saved === 'system' ||
      saved === 'contrast'
        ? saved
        : 'system';
    
    const root = window.document.documentElement;
    
    let resolved: 'dark' | 'light' | 'contrast';
    
    if (initialTheme === 'contrast') {
      resolved = 'contrast';
    } else if (initialTheme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      resolved = initialTheme;
    }
    
    // Remove all theme classes first
    root.classList.remove('dark', 'light', 'contrast');
    
    // Apply theme immediately without animation to prevent flash
    root.classList.add(resolved);
    root.setAttribute('data-theme', resolved);
    
    setThemeState(initialTheme);
  }, []);

  // STEP 2.1 - SYSTEM THEME AUTO APPLY (with proper listener)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        const root = window.document.documentElement;
        
        // Remove all theme classes
        root.classList.remove('dark', 'light', 'contrast');
        
        // Add system theme
        root.classList.add(systemTheme);
        root.setAttribute('data-theme', systemTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Toggle between dark, light, system, and contrast
  const toggleTheme = useCallback(() => {
    // Cycle: dark → light → system → contrast → dark
    let nextTheme: Theme;
    
    if (theme === 'dark') {
      nextTheme = 'light';
    } else if (theme === 'light') {
      nextTheme = 'system';
    } else if (theme === 'system') {
      nextTheme = 'contrast';
    } else {
      nextTheme = 'dark';
    }
    
    applyTheme(nextTheme);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}