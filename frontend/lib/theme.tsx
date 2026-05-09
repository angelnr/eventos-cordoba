import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'themePreference';
const VALID_THEMES: Theme[] = ['light', 'dark', 'system'];

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

function applyThemeToDOM(resolvedTheme: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_THEMES.includes(stored as Theme)) {
      return stored as Theme;
    }
  } catch {
    // localStorage unavailable (e.g. Safari private mode)
  }
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(readStoredTheme());
    setMounted(true);
  }, []);

  const resolvedTheme = resolveTheme(theme);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const current = resolveTheme(prev);
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme, mounted]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      applyThemeToDOM(getSystemTheme());
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const newValue = e.newValue;
      if (newValue && VALID_THEMES.includes(newValue as Theme)) {
        setThemeState(newValue as Theme);
      } else if (e.newValue === null) {
        setThemeState('system');
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}