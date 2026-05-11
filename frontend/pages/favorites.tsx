import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { AuthGuard } from '../components/AuthGuard';
import { FavoriteButton } from '../components/FavoriteButton';
import { useAuth } from '../lib/auth';
import { getImageUrl } from '../lib/imageUtils';

interface FavoriteEvent {
  id: number;
  title: string;
  description?: string;
  date?: string | null;
  location: string;
  capacity: number;
  price?: number | string | null;
  status: string;
  imageUrl?: string;
  organizer?: { id: number; name: string } | null;
  category?: { id: number; name: string; color: string } | null;
  availableSpots: number;
  totalBookings: number;
}

interface FavoriteItem {
  userId: number;
  eventId: number;
  createdAt: string;
  event: FavoriteEvent;
}

export default function Favorites() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

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
      return process.env.NEXT_PUBLIC_API_URL || 'https://api.eventoscordoba.xyz';
    }

    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    return 'https://api.eventoscordoba.xyz';
  };

  const handleRemoveFavorite = (eventId: number) => {
    setFavorites(prev => prev.filter(f => f.eventId !== eventId));
  };

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      if (!token) return;

      const apiUrl = getApiUrl();
      const response = await fetch(
        `${apiUrl}/api/favorites?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price?: number | string | null) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return 'Precio no disponible';
    if (numericPrice === 0) return 'Gratis';
    return `${numericPrice.toFixed(2)}€`;
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Mis Favoritos
              </h1>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Eventos que has marcado como favoritos
              </p>
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 dark:text-gray-400 text-lg">
                  Aún no tienes eventos favoritos
                </div>
                <div className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm mt-2">
                  <Link href="/events" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Explora los eventos
                  </Link>
                  {' '}y marca los que te interesen
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favorites.map((fav) => {
                    const event = fav.event;
                    return (
                      <div
                        key={fav.eventId}
                        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col"
                      >
                        <Link href={`/events/${event.id}`}>
                          <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {event.imageUrl ? (
                              <img
                                src={getImageUrl(event.imageUrl) || ''}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-event.jpg';
                                }}
                              />
                            ) : (
                              <div className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-center">
                                <div className="text-4xl mb-2" aria-hidden="true">📅</div>
                                <div className="text-sm">Sin imagen</div>
                              </div>
                            )}
                          </div>

                          <div className="p-4 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-2">
                              {event.category ? (
                                <span
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: event.category.color }}
                                >
                                  {event.category.name}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">Sin categoría</span>
                              )}
                              <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
                                {Math.max(0, event.availableSpots || 0)} plazas libres
                              </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                              {event.title}
                            </h3>

                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <div className="flex items-center mb-1">
                                <span className="mr-2" aria-hidden="true">📅</span>
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2" aria-hidden="true">📍</span>
                                {event.location}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm mt-auto pt-2">
                              <span className="text-gray-500 dark:text-gray-400">
                                Por {event.organizer?.name || 'Organizador desconocido'}
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatPrice(event.price)}
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Favorite Button - Outside Link to avoid nesting issues */}
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-white/80 dark:bg-gray-800/80 rounded-full px-1">
                            <FavoriteButton
                              eventId={event.id}
                              initialFavorited={true}
                              size="sm"
                              onToggle={handleRemoveFavorite}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      ← Anterior
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Siguiente →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
