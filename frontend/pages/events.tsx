import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import { FavoriteButton } from '../components/FavoriteButton';

interface Category {
  id: number;
  name: string;
  color: string;
  description?: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  date?: string | null;
  location: string;
  capacity: number;
  price?: number | string | null;
  status: 'active' | 'cancelled' | 'draft' | 'completed';
  imageUrl?: string;
  organizer?: {
    id: number;
    name: string;
  } | null;
  category?: {
    id: number;
    name: string;
    color: string;
  } | null;
  availableSpots: number;
  totalBookings: number;
  isFavorited?: boolean;
  favoriteCount?: number;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { user, token } = useAuth();

  // Determinar la URL del API según el entorno
  const getApiUrl = () => {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }

    const hostname = window.location.hostname;

    const isLocalhost =
      hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
      return 'http://localhost:3001';
    }

    return (
      process.env.NEXT_PUBLIC_API_URL ||
      'https://api.eventoscordoba.xyz'
    );
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = getApiUrl();

        const response = await fetch(`${apiUrl}/api/categories`);

        if (!response.ok) {
          throw new Error('Error fetching categories');
        }

        const data = await response.json();

        setCategories(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      try {
        const apiUrl = getApiUrl();

        const categoryParam = selectedCategory
          ? `&category=${selectedCategory}`
          : '';

        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${apiUrl}/api/events?page=1&limit=50&status=active${categoryParam}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error('Error fetching events');
        }

        const data = await response.json();

        setEvents(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory, token]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Fecha no disponible';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

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

    if (isNaN(numericPrice)) {
      return 'Precio no disponible';
    }

    if (numericPrice === 0) {
      return 'Gratis';
    }

    return `${numericPrice.toFixed(2)}€`;
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Eventos
            </h1>

            <p className="mt-2 text-sm text-gray-700">
              Descubre todos los eventos disponibles en Córdoba
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={
                selectedCategory === null
                  ? 'primary'
                  : 'secondary'
              }
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>

            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id
                    ? 'primary'
                    : 'secondary'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  backgroundColor:
                    selectedCategory === category.id
                      ? category.color
                      : undefined,
                  borderColor: category.color
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                No hay eventos disponibles
              </div>

              <div className="text-gray-400 text-sm mt-2">
                {selectedCategory
                  ? 'Prueba con otra categoría'
                  : 'Los eventos aparecerán aquí pronto'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/events/${event.id}`}>
                    {/* Event Image */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              '/placeholder-event.jpg';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div
                            className="text-4xl mb-2"
                            aria-hidden="true"
                          >
                            📅
                          </div>

                          <div className="text-sm">
                            Sin imagen
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-4">
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-2">
                        {event.category ? (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{
                              backgroundColor:
                                event.category.color
                            }}
                          >
                            {event.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Sin categoría
                          </span>
                        )}

                        <span className="text-sm text-gray-500">
                          {Math.max(
                            0,
                            event.availableSpots || 0
                          )}{' '}
                          plazas libres
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Date and Location */}
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center mb-1">
                          <span
                            className="mr-2"
                            aria-hidden="true"
                          >
                            📅
                          </span>

                          {formatDate(event.date)}
                        </div>

                        <div className="flex items-center">
                          <span
                            className="mr-2"
                            aria-hidden="true"
                          >
                            📍
                          </span>

                          {event.location}
                        </div>
                      </div>

                      {/* Organizer and Price */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Por{' '}
                          {event.organizer?.name ||
                            'Organizador desconocido'}
                        </span>

                        <span className="font-semibold text-green-600">
                          {formatPrice(event.price)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Favorite Button - Outside Link to avoid nesting issues */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1 bg-white/80 rounded-full px-1">
                      {event.favoriteCount !== undefined && event.favoriteCount > 0 && (
                        <span className="text-xs text-red-400 font-medium" title="Favoritos">
                          {event.favoriteCount}
                        </span>
                      )}
                      <FavoriteButton
                        eventId={event.id}
                        initialFavorited={event.isFavorited || false}
                        size="sm"
                        onToggle={(eventId, nowFavorited) => {
                          setEvents(prev => prev.map(e => {
                            if (e.id !== eventId) return e;
                            const currentCount = e.favoriteCount ?? 0;
                            return {
                              ...e,
                              isFavorited: nowFavorited,
                              favoriteCount: nowFavorited
                                ? currentCount + 1
                                : Math.max(0, currentCount - 1)
                            };
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}