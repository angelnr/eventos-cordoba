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
}

const INTERESTS_OPTIONS = [
  'Música', 'Deportes', 'Tecnología', 'Arte', 'Fotografía',
  'Gastronomía', 'Cultura', 'Viajes', 'Lectura', 'Cine',
  'Teatro', 'Danza', 'Programación', 'Innovación', 'Emprendimiento'
];

export default function EditProfile() {
  const router = useRouter();
  const { user: authUser, token: authToken, isInitializing } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    interests: [] as string[]
  });

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
    // Esperar a que termine la inicialización antes de verificar el usuario
    if (isInitializing) {
      return;
    }

    // Si después de inicializar no hay usuario, redirigir a login
    if (!authUser) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();

        const response = await fetch(`${apiUrl}/api/users/${authUser.id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.data;
          setUser(userData);
          setFormData({
            name: userData.name || '',
            bio: userData.bio || '',
            location: userData.location || '',
            interests: userData.interests || []
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser, authToken, router, isInitializing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Perfil actualizado exitosamente');
        router.push(`/profile/${user.id}`);
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar perfil: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
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

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
              <p className="mt-2 text-sm text-gray-700">
                Actualiza tu información personal y preferencias
              </p>
            </div>
            <Link href={`/profile/${user.id}`}>
              <Button variant="secondary">Ver perfil</Button>
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información básica</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">El email no se puede cambiar</p>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del perfil</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Córdoba, Argentina"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Biografía
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cuéntanos un poco sobre ti..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.bio.length}/500 caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Intereses</h2>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona tus intereses para recibir recomendaciones personalizadas
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS_OPTIONS.map((interest) => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href={`/profile/${user.id}`}>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                isLoading={saving}
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
