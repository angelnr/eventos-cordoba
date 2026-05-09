import React, { useState } from 'react';

interface RatingFilterProps {
  value?: number;
  onChange: (rating?: number) => void;
  average?: number;
}

const RATINGS = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];

export default function RatingFilter({ value, onChange }: RatingFilterProps) {
  const [hover, setHover] = useState<number | null>(null);

  const displayValue = hover ?? value;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating mínimo</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = displayValue != null && star <= displayValue;
          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(value === star ? undefined : star)}
              className={`text-xl transition-colors ${
                filled ? 'text-yellow-400 dark:text-yellow-500' : 'text-gray-300 dark:text-gray-600'
              } hover:text-yellow-400 focus:outline-none`}
              aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
            >
              {filled ? '★' : '☆'}
            </button>
          );
        })}
        {value != null && (
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{value}+</span>
        )}
      </div>
    </div>
  );
}
