import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useFavorites } from '../lib/useFavorites';
import { showError } from '../lib/notifications';

interface FavoriteButtonProps {
  eventId: number;
  initialFavorited?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onToggle?: (eventId: number, nowFavorited: boolean) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  eventId,
  initialFavorited = false,
  size = 'md',
  showLabel = false,
  className = '',
  onToggle
}) => {
  const { user } = useAuth();
  const { toggleFavorite } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    const success = await toggleFavorite(eventId, previousState);
    if (!success) {
      setIsFavorited(previousState);
      showError('No se pudo actualizar favoritos. Inténtalo de nuevo.');
    } else if (onToggle) {
      onToggle(eventId, !previousState);
    }
    setIsLoading(false);
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    await handleActivate(e);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      await handleActivate(e);
    }
  };

  const sizeClasses = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };

  return (
    <span
      data-testid="favorite-button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-disabled={isLoading}
      className={`inline-flex items-center gap-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 rounded-full p-1 cursor-pointer ${
        isFavorited ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-red-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${sizeClasses[size]} ${className}`}
      aria-label={isFavorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      title={isFavorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      {isFavorited ? '❤️' : '🤍'}
      {showLabel && (
        <span className={`text-sm ${isFavorited ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {isFavorited ? 'En favoritos' : 'Añadir a favoritos'}
        </span>
      )}
    </span>
  );
};
