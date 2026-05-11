import React, { useState, useEffect } from 'react';
import { AuthGuard } from '../components/AuthGuard';
import { Layout } from '../components/Layout';
import { useAuth } from '../lib/auth';
import { showSuccess, showError } from '../lib/notifications';
import { Button } from '../components/ui/Button';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { MetricsFilters } from '../components/dashboard/MetricsFilters';
import { StatusDistribution } from '../components/dashboard/StatusDistribution';
import { useDashboardMetrics } from '../lib/queries/useDashboardMetrics';

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

  // Filtros de métricas
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [scope, setScope] = useState<'mine' | 'all'>('mine');

  // Query de métricas con filtros
  const {
    data: metricsData,
    refetch: refetchMetrics,
    isRefetching: isMetricsRefetching,
  } = useDashboardMetrics(
    {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status || undefined,
      scope,
    },
    token || undefined
  );

  const metrics = metricsData?.data;

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatus('');
  };

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
      return process.env.NEXT_PUBLIC_API_URL || 'https://api.eventoscordoba.xyz';
    }

    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    return 'https://api.eventoscordoba.xyz';
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
        showSuccess(`${data.message} — Usuarios generados: ${data.data.map((u: UserListItem) => u.name).join(', ')}`);
        fetchUsers();
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
        showSuccess('Usuario eliminado exitosamente');
        fetchUsers();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const canViewMetrics = isAdmin || isOrganizer;

  if (!user) {
    return (
      <AuthGuard>
        <Layout>
          <div className="px-4 py-6 sm:px-0">
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (!canViewMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Solo organizadores y administradores pueden acceder al dashboard.
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
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Bienvenido a tu panel de control, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${scope === 'mine' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    Mis Eventos
                  </span>
                  <button
                    onClick={() => setScope(scope === 'mine' ? 'all' : 'mine')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      scope === 'all' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      scope === 'all' ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className={`text-sm font-medium ${scope === 'all' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    Todos
                  </span>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetchMetrics()}
                disabled={isMetricsRefetching}
              >
                <svg className={`w-4 h-4 mr-1.5 ${isMetricsRefetching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isMetricsRefetching ? 'Actualizando...' : 'Refrescar'}
              </Button>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="mb-8">
            <MetricsFilters
              startDate={startDate}
              endDate={endDate}
              status={status}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onStatusChange={setStatus}
              onReset={clearFilters}
            />
            <MetricsGrid
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              status={status || undefined}
              scope={scope}
              token={token || undefined}
            />
            {metrics && (
              <div className="mt-6">
                <StatusDistribution
                  eventsByStatus={metrics.eventsByStatus}
                  totalEvents={metrics.totalEvents}
                />
              </div>
            )}
          </div>

          {/* User Management Section (admin only) */}
          {isAdmin && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gestión de Usuarios</h2>
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
                <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha de Registro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{userItem.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{userItem.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{userItem.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(userItem.createdAt).toLocaleDateString('es-ES')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteUser(userItem.id, userItem.name || userItem.email)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-white inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            disabled={userItem.id === user?.id}
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
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay usuarios registrados aún.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
