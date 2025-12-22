import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  interests: string[];
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface UserEvents {
  id: number;
  title: string;
  date: string;
  location: string;
  category: {
    name: string;
    color: string;
  };
  status: string;
}

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<UserEvents[]>([]);
  const [loading, setLoading] = useState(true);

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

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();

        // Fetch user profile
        const userResponse = await fetch(`${apiUrl}/api/users/${id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.data);
        }

        // Fetch user's events (organized events)
        const eventsResponse = await fetch(`${apiUrl}/api/events?organizerId=${id}&limit=10`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.data || []);
        }

      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Usuario no encontrado</div>
          <Link href="/">
            <Button className="mt-4">Volver al inicio</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              {/* Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-600 font-medium text-2xl">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {user.isVerified && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
                <p className="text-gray-600 capitalize">
                  {user.role === 'organizer' ? 'Organizador' :
                   user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </p>

                {user.location && (
                  <p className="text-gray-500 text-sm mt-1">
                    📍 {user.location}
                  </p>
                )}

                {/* Edit Profile Button */}
                {authUser && authUser.id === user.id && (
                  <div className="mt-4">
                    <Link href="/profile/edit">
                      <Button size="sm" className="w-full">
                        Editar perfil
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sobre mí</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Interests */}
              {user.interests && user.interests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Intereses</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Miembro desde:</span>
                    <span className="font-medium">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Eventos organizados:</span>
                    <span className="font-medium">{events.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Events Organized */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Eventos organizados ({events.length})
                </h2>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">No hay eventos organizados</div>
                  <div className="text-gray-400 text-sm">
                    {user.role === 'organizer' ? 'Los eventos aparecerán aquí cuando los organice' : 'Este usuario aún no ha organizado eventos'}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: event.category.color }}
                            >
                              {event.category.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            📅 {formatDate(event.date)} • 📍 {event.location}
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === 'active' ? 'bg-green-100 text-green-800' :
                            event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status === 'active' ? 'Activo' :
                             event.status === 'cancelled' ? 'Cancelado' : 'Completado'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
