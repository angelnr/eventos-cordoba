import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGuard } from '../../components/AuthGuard';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';

interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
  status: string;
  imageUrl?: string;
  organizer: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
    color: string;
    description?: string;
  };
  bookings: Array<{
    id: number;
    quantity: number;
    status: string;
    totalPrice: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  availableSpots: number;
  totalBookings: number;
}

export default function MyEventsPage() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determinar la URL del API según el entorno
  const getApiUrl = () => {
    if (typeof window === 'undefined') {
      return 'http://localhost:3001';
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isProduction = hostname === 'eventoscordoba.xyz';

    if (isLocalhost) {
      return 'http://localhost:3001';
    }

    if (isProduction) {
      return 'https://api.eventoscordoba.xyz';
    }

    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    return '';
  };

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/events/my-events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar tus eventos');
        }

        if (data.success) {
          setEvents(data.data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `${price.toFixed(2)}€`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
      completed: { label: 'Completado', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
                <p className="mt-2 text-gray-600">
                  Gestiona los eventos que has organizado.
                </p>
              </div>
              <Link href="/events/create">
                <Button>
                  + Crear Evento
                </Button>
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Events List */}
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No has creado ningún evento aún</h3>
              <p className="text-gray-500 mb-6">
                ¡Es hora de organizar tu primer evento! Crea experiencias inolvidables para la comunidad.
              </p>
              <Link href="/events/create">
                <Button>
                  Crear Mi Primer Evento
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Event Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-4xl">📅</div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    {/* Category and Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: event.category.color }}
                      >
                        {event.category.name}
                      </span>
                      {getStatusBadge(event.status)}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Date and Location */}
                    <div className="space-y-1 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        {event.location}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{event.totalBookings}</div>
                        <div className="text-gray-500">Reservas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{event.availableSpots}</div>
                        <div className="text-gray-500">Disponibles</div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-4">
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(event.price)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link href={`/events/${event.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" fullWidth>
                          Ver Evento
                        </Button>
                      </Link>
                      <Button variant="secondary" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
