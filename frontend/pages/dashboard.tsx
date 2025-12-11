import React, { useState, useEffect } from 'react';
import { AuthGuard } from '../components/AuthGuard';
import { Layout } from '../components/Layout';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';

interface UserListItem {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determinar la URL del API según el entorno
  const getApiUrl = () => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      return 'http://localhost:3001'; // Fallback para SSR
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isProduction = hostname === 'eventoscordoba.xyz';

    console.log('📊 Dashboard - Hostname detectado:', hostname);
    console.log('🏠 Dashboard - Es localhost:', isLocalhost);
    console.log('🏭 Dashboard - Es producción:', isProduction);

    // En desarrollo (localhost)
    if (isLocalhost) {
      // Priorizar localhost:3001 para desarrollo
      return 'http://localhost:3001';
    }

    // En producción (eventoscordoba.xyz) - usar URL conocida
    if (isProduction) {
      return 'https://api.eventoscordoba.xyz';
    }

    // En producción - usar la URL configurada
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    // Fallback: asumir que el backend está en el mismo dominio
    return '';
  };

  // Fetch users list
  const fetchUsers = async () => {
    if (!token) return;

    setIsLoadingUsers(true);
    setError(null);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar usuarios');
      }

      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Generate test users
  const generateUsers = async (count: number = 5) => {
    setError(null);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/users/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar usuarios');
      }

      if (data.success) {
        alert(`${data.message}\nUsuarios generados: ${data.data.map((u: UserListItem) => u.name).join(', ')}`);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    }
  };

  // Delete user
  const deleteUser = async (userId: number, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setError(null);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar usuario');
      }

      if (data.success) {
        alert('Usuario eliminado exitosamente');
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Verificar permisos después de ejecutar todos los hooks
  const isAdmin = user?.role === 'admin';
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6">
              Solo los administradores pueden acceder al dashboard.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Bienvenido a tu panel de control, {user?.name}
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tu Información</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ID de Usuario</label>
                <p className="mt-1 text-sm text-gray-900">{user?.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                <p className="mt-1 text-sm text-gray-900">
                  Usuario autenticado
                </p>
              </div>
            </div>
          </div>

          {/* Users Management */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Gestión de Usuarios</h2>
              <div className="space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => generateUsers(3)}
                  disabled={isLoadingUsers}
                >
                  Generar 3 Usuarios
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => generateUsers(10)}
                  disabled={isLoadingUsers}
                >
                  Generar 10 Usuarios
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                >
                  {isLoadingUsers ? 'Cargando...' : 'Actualizar Lista'}
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {userItem.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userItem.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userItem.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(userItem.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteUser(userItem.id, userItem.name || userItem.email)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          disabled={userItem.id === user?.id} // No permitir eliminar al propio admin
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && !isLoadingUsers && (
                <div className="text-center py-8 text-gray-500">
                  No hay usuarios registrados aún.
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
