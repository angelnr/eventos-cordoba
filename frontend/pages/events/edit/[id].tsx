import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthGuard } from '../../../components/AuthGuard';
import { Layout } from '../../../components/Layout';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../lib/auth';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    status: 'active',
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

  // Cargar evento
  useEffect(() => {
    if (!id || !token) return;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const eventData = data.data;
          
          // Verificar que el usuario sea el organizador
          if (eventData.organizerId !== user?.id && user?.role !== 'admin') {
            alert('No tienes permisos para editar este evento');
            router.push('/events/my-events');
            return;
          }

          setEvent(eventData);

          // Formatear la fecha para datetime-local input
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
            imageUrl: eventData.imageUrl || '',
            status: eventData.status,
          });
        } else {
          alert('Error al cargar el evento');
          router.push('/events/my-events');
        }
      } catch (error) {
        console.error('Error loading event:', error);
        alert('Error al cargar el evento');
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
      const response = await fetch(`${apiUrl}/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          date: new Date(formData.date).toISOString(),
          location: formData.location,
          capacity: parseInt(formData.capacity),
          price: parseFloat(formData.price) || 0,
          categoryId: parseInt(formData.categoryId),
          imageUrl: formData.imageUrl || null,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el evento');
      }

      if (data.success) {
        alert('¡Evento actualizado exitosamente!');
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
            <div className="text-gray-500 text-lg">Evento no encontrado</div>
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
                <h1 className="text-3xl font-bold text-gray-900">Editar Evento</h1>
                <p className="mt-2 text-gray-600">
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
          <div className="bg-white shadow-lg rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ej: Concierto de Jazz en el Parque"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe los detalles del evento, qué actividades habrá, etc."
                />
              </div>

              {/* Date and Time */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ubicación *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ej: Plaza de la Constitución, Córdoba"
                />
              </div>

              {/* Capacity and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ej: 100"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00 (gratis)"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  URL de la Imagen
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Opcional. Añade una URL de imagen para hacer el evento más atractivo.
                </p>
                {formData.imageUrl && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                    <img
                      src={formData.imageUrl}
                      alt="Vista previa"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.alt = 'Error al cargar la imagen';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Categoría *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Estado del Evento
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="active">Activo</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="completed">Completado</option>
                </select>
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
