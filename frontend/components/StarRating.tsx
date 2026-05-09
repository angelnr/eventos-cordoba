import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };

  const displayRating = hoverRating || rating;

  const handleClick = (star: number) => {
    if (!readOnly && onChange) {
      onChange(star);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    const key = e.key;
    if (['1', '2', '3', '4', '5'].includes(key)) {
      e.preventDefault();
      if (onChange) onChange(parseInt(key));
    }
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`inline-flex items-center ${gapClasses[size]}`}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `Puntuación: ${rating} de 5 estrellas` : 'Seleccionar puntuación'}
      onKeyDown={handleKeyDown}
      tabIndex={readOnly ? -1 : 0}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${sizeClasses[size]} transition-colors duration-150 select-none ${
            star <= displayRating
              ? 'text-yellow-400 dark:text-yellow-500'
              : 'text-gray-300 dark:text-gray-600'
          } ${
            !readOnly
              ? 'cursor-pointer hover:scale-110'
              : ''
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => { if (!readOnly) setHoverRating(star); }}
          onMouseLeave={() => { if (!readOnly) setHoverRating(0); }}
          role={readOnly ? undefined : 'radio'}
          aria-checked={readOnly ? undefined : star === rating}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          tabIndex={readOnly ? -1 : -1}
        >
          ★
        </span>
      ))}
      {showValue && (
        <span className="ml-2 text-gray-600 dark:text-gray-400 font-medium text-sm">
          {rating > 0 ? rating.toFixed(1) : '-'}
        </span>
      )}
    </div>
  );
};
