import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthGuard } from '../../../components/AuthGuard';
import { Layout } from '../../../components/Layout';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../lib/auth';
import { getApiUrl } from '../../../lib/api';

interface Attendee {
  ticketId: number;
  scannedAt: string;
  validatedBy: { id: number; name: string } | null;
  user: { id: number; name: string; email: string };
}

interface Stats {
  total: number;
  valid: number;
  used: number;
  invalidated: number;
  expired: number;
}

export default function EventAttendeesPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuth();
  const eventId = typeof id === 'string' ? parseInt(id) : 0;

  const [eventTitle, setEventTitle] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ticketsCount, setTicketsCount] = useState(0);

  useEffect(() => {
    if (!eventId || !token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = getApiUrl();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch event info, attendees, and ticket stats in parallel
        const [eventRes, attendeesRes, ticketsRes] = await Promise.all([
          fetch(`${apiUrl}/api/events/${eventId}`, { headers }),
          fetch(`${apiUrl}/api/tickets/event/${eventId}/attendees?page=${page}&limit=50`, { headers }),
          fetch(`${apiUrl}/api/tickets/event/${eventId}?page=1&limit=1`, { headers }),
        ]);

        const eventData = await eventRes.json();
        if (eventData.success) setEventTitle(eventData.data.title);

        const attendeesData = await attendeesRes.json();
        if (attendeesData.success) {
          setAttendees(attendeesData.data.attendees || []);
          setTotalPages(Math.ceil((attendeesData.data.total || 0) / 50));
          setTicketsCount(attendeesData.data.total || 0);
        } else {
          setError(attendeesData.error);
        }

        const ticketsData = await ticketsRes.json();
        if (ticketsData.success) {
          setStats(ticketsData.data.stats);
        }
      } catch (err) {
        setError('Error al cargar datos del evento');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, token, page]);

  if (error && !loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <Link href="/my-events">
              <Button variant="secondary">Volver a mis eventos</Button>
            </Link>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-4xl mx-auto mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Asistentes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {eventTitle || 'Cargando...'}
              </p>
            </div>
            <Link href={`/events/${eventId}`}>
              <Button variant="secondary">Ver evento</Button>
            </Link>
          </div>

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg" />
              ))}
            </div>
          )}

          {!loading && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Válidas</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Usadas</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.invalidated}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Invalidadas</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.expired}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expiradas</p>
              </div>
            </div>
          )}

          {!loading && attendees.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400">
                Aún no hay asistentes verificados
              </p>
            </div>
          )}

          {!loading && attendees.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Validado</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {attendees.map((a) => (
                      <tr key={a.ticketId} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{a.user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{a.user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(a.scannedAt).toLocaleString('es-ES')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {a.validatedBy?.name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
