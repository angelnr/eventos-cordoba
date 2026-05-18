import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors';
  const normalClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800 dark:placeholder-gray-500';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-800 dark:focus:border-red-400 dark:focus:ring-red-800';

  const inputClasses = `${baseClasses} ${error ? errorClasses : normalClasses} ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        data-testid="input"
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};