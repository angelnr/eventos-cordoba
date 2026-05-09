import React from 'react';
import { useTheme } from '../../lib/theme';

export const ThemeToggle: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg
                 text-gray-500 transition-colors
                 hover:bg-gray-100 hover:text-gray-900
                 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 dark:focus:ring-offset-gray-900"
    >
      <svg
        className={`h-5 w-5 transition-transform ${resolvedTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.757l-.707-.707m12.728 0l-.707.707M6.343 17.243l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <svg
        className={`absolute h-5 w-5 transition-transform ${resolvedTheme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  );
};