import { useCallback } from 'react';
import { useAuth } from './auth';

export function useFavorites() {
  const { token } = useAuth();

  const getApiUrl = () => {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isProduction = hostname === 'eventoscordoba.xyz';

    if (isLocalhost) {
      return 'http://localhost:3001';
    }

    if (isProduction) {
      return '';
    }

    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    return '';
  };

  const toggleFavorite = useCallback(async (eventId: number, wasFavorited: boolean): Promise<boolean> => {
    if (!token) return false;

    try {
      const apiUrl = getApiUrl();
      const url = wasFavorited
        ? `${apiUrl}/api/favorites/${eventId}`
        : `${apiUrl}/api/favorites`;

      const response = await fetch(url, {
        method: wasFavorited ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        ...(wasFavorited ? {} : { body: JSON.stringify({ eventId }) })
      });

      return response.ok;
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return false;
    }
  }, [token]);

  return { toggleFavorite };
}
