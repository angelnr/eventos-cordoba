import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';

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
  date: string;
  location: string;
  capacity: number;
  price: number;
  status: string;
  imageUrl?: string;
  organizer: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
    color: string;
  };
  availableSpots: number;
  totalBookings: number;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

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
    const fetchCategories = async () => {
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const categoryParam = selectedCategory ? `&category=${selectedCategory}` : '';
        const response = await fetch(`${apiUrl}/api/events?page=1&limit=50&status=active${categoryParam}`);

        if (response.ok) {
          const data = await response.json();
          setEvents(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory]);

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

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
            <p className="mt-2 text-sm text-gray-700">
              Descubre todos los eventos disponibles en Córdoba
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  backgroundColor: selectedCategory === category.id ? category.color : undefined,
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
              <div className="text-gray-500 text-lg">No hay eventos disponibles</div>
              <div className="text-gray-400 text-sm mt-2">
                {selectedCategory ? 'Prueba con otra categoría' : 'Los eventos aparecerán aquí pronto'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    {/* Event Image */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="text-4xl mb-2">📅</div>
                          <div className="text-sm">Sin imagen</div>
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-4">
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: event.category.color }}
                        >
                          {event.category.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {event.availableSpots} plazas libres
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Date and Location */}
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center mb-1">
                          <span className="mr-2">📅</span>
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          {event.location}
                        </div>
                      </div>

                      {/* Organizer and Price */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Por {event.organizer.name}
                        </span>
                        <span className="font-semibold text-green-600">
                          {formatPrice(event.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
