import { useState, useEffect, useCallback } from 'react';

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
  distribution: { [key: string]: number };
  userReview: {
    id: number;
    rating: number;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface Review {
  id: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  eventId: number;
  isOwner?: boolean;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

interface UseReviewsReturn {
  stats: ReviewStats | null;
  reviews: Review[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  createReview: (eventId: number, rating: number) => Promise<boolean>;
  updateReview: (reviewId: number, rating: number) => Promise<boolean>;
  deleteReview: (reviewId: number) => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isProduction = hostname === 'eventoscordoba.xyz';
  if (isLocalhost) return 'http://localhost:3001';
  if (isProduction) return process.env.NEXT_PUBLIC_API_URL || 'https://api.eventoscordoba.xyz';
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return 'https://api.eventoscordoba.xyz';
};

export function useReviews(eventId: number | undefined, token: string | null): UseReviewsReturn {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [initialLoading, setInitialLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!eventId) return;
    try {
      const apiUrl = getApiUrl();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(
        `${apiUrl}/api/reviews/events/${eventId}/stats`,
        { headers }
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
        setError(null);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Error al cargar estadísticas');
      }
    } catch (err) {
      setError('Error de conexión. Intentá de nuevo.');
      console.error('Fetch review stats error:', err);
    }
  }, [eventId, token]);

  const fetchReviews = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!eventId) return;
    try {
      const apiUrl = getApiUrl();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(
        `${apiUrl}/api/reviews/events/${eventId}?page=${pageNum}&limit=10`,
        { headers }
      );
      if (response.ok) {
        const data = await response.json();
        const mappedReviews = data.data.map((r: Review) => {
          let isOwner = false;
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              isOwner = r.userId === payload.id;
            } catch (e) {
              // ignore parse errors
            }
          }
          return { ...r, isOwner };
        });
        if (append) {
          setReviews(prev => [...prev, ...mappedReviews]);
        } else {
          setReviews(mappedReviews);
        }
        setTotalPages(data.pagination?.pages ?? 0);
        setError(null);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Error al cargar reseñas');
      }
    } catch (err) {
      setError('Error de conexión. Intentá de nuevo.');
      console.error('Fetch reviews error:', err);
    }
  }, [eventId, token]);

  useEffect(() => {
    if (!eventId) return;
    setPage(1);
    setReviews([]);
    setInitialLoading(true);
    Promise.all([fetchStats(), fetchReviews(1)]).finally(() => setInitialLoading(false));
  }, [eventId, fetchStats, fetchReviews]);

  const loadMore = async () => {
    const nextPage = page + 1;
    if (nextPage > totalPages) return;
    setPage(nextPage);
    setLoading(true);
    await fetchReviews(nextPage, true);
    setLoading(false);
  };

  const createReview = async (eId: number, rating: number): Promise<boolean> => {
    if (!token) return false;

    // Optimistic update de stats
    if (stats) {
      const newCount = stats.reviewCount + 1;
      const newAvg = (stats.averageRating * stats.reviewCount + rating) / newCount;
      setStats({
        ...stats,
        averageRating: Math.round(newAvg * 100) / 100,
        reviewCount: newCount,
        distribution: {
          ...stats.distribution,
          [String(rating)]: (stats.distribution[String(rating)] || 0) + 1,
        },
        userReview: {
          id: -Date.now(),
          rating,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: eId, rating }),
      });

      if (response.ok) {
        await Promise.all([fetchStats(), fetchReviews(1)]);
        return true;
      } else {
        const errData = await response.json();
        await fetchStats();
        setError(errData.error || 'Error al crear reseña');
        return false;
      }
    } catch (err) {
      await fetchStats();
      setError('Error de conexión. Intentá de nuevo.');
      return false;
    }
  };

  const updateReview = async (reviewId: number, rating: number): Promise<boolean> => {
    if (!token || !stats?.userReview) return false;

    const oldRating = stats.userReview.rating;

    // Optimistic update
    if (stats) {
      const newAvg = (stats.averageRating * stats.reviewCount - oldRating + rating) / stats.reviewCount;
      setStats({
        ...stats,
        averageRating: Math.round(Math.max(0, newAvg) * 100) / 100,
        distribution: {
          ...stats.distribution,
          [String(oldRating)]: Math.max(0, (stats.distribution[String(oldRating)] || 0) - 1),
          [String(rating)]: (stats.distribution[String(rating)] || 0) + 1,
        },
        userReview: { ...stats.userReview, rating, updatedAt: new Date().toISOString() },
      });
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        await fetchStats();
        return true;
      } else {
        const errData = await response.json();
        await fetchStats();
        setError(errData.error || 'Error al actualizar reseña');
        return false;
      }
    } catch (err) {
      await fetchStats();
      setError('Error de conexión. Intentá de nuevo.');
      return false;
    }
  };

  const deleteReview = async (reviewId: number): Promise<boolean> => {
    if (!token || !stats?.userReview) return false;

    const deletedRating = stats.userReview.rating;

    // Optimistic update
    if (stats) {
      const newCount = stats.reviewCount - 1;
      const newAvg = newCount > 0
        ? (stats.averageRating * stats.reviewCount - deletedRating) / newCount
        : 0;
      setStats({
        ...stats,
        averageRating: Math.round(Math.max(0, newAvg) * 100) / 100,
        reviewCount: newCount,
        distribution: {
          ...stats.distribution,
          [String(deletedRating)]: Math.max(0, (stats.distribution[String(deletedRating)] || 0) - 1),
        },
        userReview: null,
      });
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await Promise.all([fetchStats(), fetchReviews(1)]);
        return true;
      } else {
        const errData = await response.json();
        await fetchStats();
        await fetchReviews(1);
        setError(errData.error || 'Error al eliminar reseña');
        return false;
      }
    } catch (err) {
      await fetchStats();
      await fetchReviews(1);
      setError('Error de conexión. Intentá de nuevo.');
      return false;
    }
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  return {
    stats,
    reviews,
    loading: initialLoading || loading,
    error,
    hasMore: page < totalPages,
    loadMore,
    createReview,
    updateReview,
    deleteReview,
    refreshStats,
  };
}
