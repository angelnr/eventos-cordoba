import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthGuard } from '../../../components/AuthGuard';
import { Layout } from '../../../components/Layout';
import { Button } from '../../../components/ui/Button';
import { ImageUpload } from '../../../components/ui/ImageUpload';
import { useAuth } from '../../../lib/auth';
import { showSuccess, showError } from '../../../lib/notifications';

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
  imageUrl?: string;
  status: string;
  categoryId: number;
  organizerId: number;
}

export default function EditEventPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    price: '',
    categoryId: '',
    status: 'active',
  });
  const [imageData, setImageData] = useState<{ file: File | null; externalUrl: string | null; removed: boolean }>({
    file: null,
    externalUrl: null,
    removed: false,
  });
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

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/categories`);

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.data);
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    fetchCategories();
  }, []);

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
  FULL: 'Completo',
};

const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);

// Cargar evento
useEffect(() => {
  if (!id || !token) return;

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();

      // Fetch event data and allowed transitions in parallel
      const [eventRes, transitionsRes] = await Promise.all([
        fetch(`${apiUrl}/api/events/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/events/status-transitions`),
      ]);

      if (eventRes.ok && transitionsRes.ok) {
        const eventData = (await eventRes.json()).data;
        const transitionsData = (await transitionsRes.json()).data;

        if (eventData.organizerId !== user?.id && user?.role !== 'admin') {
          showError('No tienes permisos para editar este evento');
          router.push('/events/my-events');
          return;
        }

        const currentStatus = eventData.status;
        const config = transitionsData[currentStatus];
        if (config) {
          setAllowedTransitions(config.allowedTransitions);
        }

        setEvent(eventData);
        setEventImageUrl(eventData.imageUrl || null);

        const dateObj = new Date(eventData.date);
        const formattedDate = dateObj.toISOString().slice(0, 16);

        setFormData({
          title: eventData.title,
          description: eventData.description || '',
          date: formattedDate,
          location: eventData.location,
          capacity: eventData.capacity.toString(),
          price: eventData.price.toString(),
          categoryId: eventData.categoryId.toString(),
          status: currentStatus,
        });
      } else {
        showError('Error al cargar el evento');
        router.push('/events/my-events');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      showError('Error al cargar el evento');
      router.push('/events/my-events');
    } finally {
      setLoading(false);
    }
  };

  fetchEvent();
}, [id, token, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = getApiUrl();

      // If status changed, call PATCH /status first
      if (formData.status !== event?.status && event) {
        const statusRes = await fetch(`${apiUrl}/api/events/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: formData.status, reason: 'Cambio de estado desde edición' }),
        });

        if (!statusRes.ok) {
          const statusData = await statusRes.json();
          throw new Error(statusData.error || 'Error al cambiar el estado del evento');
        }
      }

      // Update event fields (without status)
      const formDataBody = new FormData();
      formDataBody.append('title', formData.title);
      formDataBody.append('description', formData.description || '');
      formDataBody.append('date', new Date(formData.date).toISOString());
      formDataBody.append('location', formData.location);
      formDataBody.append('capacity', formData.capacity);
      formDataBody.append('price', formData.price || '0');
      formDataBody.append('categoryId', formData.categoryId);

      if (imageData.file) {
        formDataBody.append('image', imageData.file);
      } else if (imageData.removed) {
        formDataBody.append('imageUrl', '');
      } else if (imageData.externalUrl) {
        formDataBody.append('imageUrl', imageData.externalUrl);
      }

      const response = await fetch(`${apiUrl}/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataBody,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el evento');
      }

      if (data.success) {
        showSuccess('¡Evento actualizado exitosamente!');
        router.push(`/events/${id}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  if (!event) {
    return (
      <AuthGuard>
        <Layout>
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg">Evento no encontrado</div>
            <Link href="/events/my-events">
              <Button className="mt-4">Volver a mis eventos</Button>
            </Link>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Editar Evento</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Actualiza la información de tu evento.
                </p>
              </div>
              <Link href={`/events/${id}`}>
                <Button variant="secondary">
                  ← Ver Evento
                </Button>
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ej: Concierto de Jazz en el Parque"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe los detalles del evento, qué actividades habrá, etc."
                />
              </div>

              {/* Date and Time */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ubicación *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ej: Plaza de la Constitución, Córdoba"
                />
              </div>

              {/* Capacity and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Capacidad Máxima *
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ej: 100"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Precio (€)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00 (gratis)"
                  />
                </div>
              </div>

              {/* Image */}
              <ImageUpload
                mode="edit"
                currentImageUrl={eventImageUrl}
                onImageChange={setImageData}
                onError={(err) => setError(err)}
              />

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categoría *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado del Evento
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={event?.status || ''}>
                    {STATUS_LABELS[event?.status || ''] || event?.status || 'Desconocido'} (actual)
                  </option>
                  {allowedTransitions.map((s: string) => (
                    <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                  ))}
                </select>
                {event?.status === 'FINISHED' || event?.status === 'CANCELLED' ? (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Este evento no puede cambiar de estado.
                  </p>
                ) : allowedTransitions.length === 0 ? (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No hay transiciones disponibles desde este estado.
                  </p>
                ) : null}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Link href={`/events/${id}`}>
                  <Button variant="secondary" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
