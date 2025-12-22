import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
    role: string;
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

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

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
    if (!id) return;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/events/${id}`);

        if (response.ok) {
          const data = await response.json();
          setEvent(data.data);
        } else if (response.status === 404) {
          // Event not found
          router.push('/events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, router]);

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

  const handleBooking = async () => {
    if (!user || !token || !event) return;

    setBookingLoading(true);
    try {
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        alert('¡Reserva realizada con éxito!');
        // Refresh event data
        router.reload();
      } else {
        const errorData = await response.json();
        alert(`Error al realizar la reserva: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error booking event:', error);
      alert('Error al realizar la reserva. Inténtalo de nuevo.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!user || !token || !event) return;

    setBookingLoading(true);
    try {
      // Find user's booking for this event
      const userBooking = event.bookings.find(
        booking => booking.user.id === user.id && booking.status === 'confirmed'
      );

      if (!userBooking) {
        alert('No se encontró tu reserva para este evento');
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/bookings/${userBooking.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('¡Reserva cancelada con éxito!');
        // Refresh event data
        router.reload();
      } else {
        const errorData = await response.json();
        alert(`Error al cancelar la reserva: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Error al cancelar la reserva. Inténtalo de nuevo.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Evento no encontrado</div>
          <Link href="/events">
            <Button className="mt-4">Volver a eventos</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isOrganizer = user?.id === event.organizer.id;
  const hasBooked = user && event.bookings.some(booking => booking.user.id === user.id && booking.status === 'confirmed');
  const canBook = user && !isOrganizer && !hasBooked && event.availableSpots > 0 && event.status === 'active';
  const isPastEvent = new Date(event.date) < new Date();

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="secondary" size="sm">
              ← Volver a eventos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="mb-6">
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <div className="text-xl">Sin imagen</div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Category and Status */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: event.category.color }}
                >
                  {event.category.name}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === 'active' ? 'bg-green-100 text-green-800' :
                  event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.status === 'active' ? 'Activo' :
                   event.status === 'cancelled' ? 'Cancelado' : 'Completado'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

              {/* Description */}
              {event.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📅 Fecha y Hora</h3>
                  <p className="text-gray-700">{formatDate(event.date)}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📍 Ubicación</h3>
                  <p className="text-gray-700">{event.location}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Capacidad</h3>
                  <p className="text-gray-700">
                    {event.capacity} personas total
                    <br />
                    {event.availableSpots} plazas disponibles
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 Precio</h3>
                  <p className="text-xl font-semibold text-green-600">
                    {formatPrice(event.price)}
                  </p>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">👤 Organizador</h3>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {event.organizer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 font-medium">{event.organizer.name}</p>
                    <p className="text-gray-500 text-sm">{event.organizer.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              {/* Booking Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de reservas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total reservas:</span>
                    <span className="font-medium">{event.totalBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plazas disponibles:</span>
                    <span className="font-medium text-green-600">{event.availableSpots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacidad total:</span>
                    <span className="font-medium">{event.capacity}</span>
                  </div>
                </div>
              </div>

              {/* Booking Button */}
              {isOrganizer ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Eres el organizador de este evento</p>
                  <Link href="/dashboard">
                    <Button fullWidth>Ir al Dashboard</Button>
                  </Link>
                </div>
              ) : user ? (
                hasBooked ? (
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={handleCancelBooking}
                    isLoading={bookingLoading}
                    disabled={bookingLoading}
                  >
                    Cancelar Reserva
                  </Button>
                ) : canBook && !isPastEvent ? (
                  <Button
                    fullWidth
                    onClick={handleBooking}
                    isLoading={bookingLoading}
                    disabled={bookingLoading}
                  >
                    Reservar Plaza
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600">
                      {isPastEvent ? 'Este evento ya ha pasado' :
                       event.availableSpots === 0 ? 'Evento completo' :
                       'No puedes reservar este evento'}
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Inicia sesión para reservar</p>
                  <Link href="/login">
                    <Button fullWidth>Iniciar Sesión</Button>
                  </Link>
                </div>
              )}

              {/* Recent Bookings (if organizer) */}
              {isOrganizer && event.bookings.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Últimas reservas</h4>
                  <div className="space-y-3">
                    {event.bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{booking.user.name}</p>
                          <p className="text-gray-500">{booking.quantity} plaza{booking.quantity > 1 ? 's' : ''}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmada' :
                           booking.status === 'cancelled' ? 'Cancelada' : booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
