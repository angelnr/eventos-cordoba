import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthGuard } from '../../components/AuthGuard';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { TicketStatus } from '../../components/TicketStatus';
import { useAuth } from '../../lib/auth';
import { useTicket } from '../../lib/queries/useTickets';
import { getApiUrl } from '../../lib/api';
import { showSuccess, showError } from '../../lib/notifications';

export default function TicketDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuth();
  const rawId = typeof id === 'string' ? id : '';
  const ticketId = /^\d+$/.test(rawId) ? parseInt(rawId) : 0;
  const { data, isLoading, error } = useTicket(ticketId, token);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const prevQrUrl = useRef<string | null>(null);

  const ticket = data?.data;

  useEffect(() => {
    return () => {
      if (prevQrUrl.current) {
        URL.revokeObjectURL(prevQrUrl.current);
      }
    };
  }, []);

  const handleShowQr = useCallback(async () => {
    if (!ticket || !token) return;
    if (qrUrl) {
      setQrUrl(null);
      return;
    }
    setQrLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/tickets/qr/${ticket.token}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al cargar QR');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (prevQrUrl.current) URL.revokeObjectURL(prevQrUrl.current);
      prevQrUrl.current = url;
      setQrUrl(url);
    } catch (err) {
      console.error('Error loading QR:', err);
    } finally {
      setQrLoading(false);
    }
  }, [ticket, token, qrUrl]);

  const handleDownload = useCallback(async () => {
    if (!ticket || !token) return;
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/tickets/qr/${ticket.token}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al descargar QR');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `entrada-${ticket.event?.title?.replace(/\s+/g, '-').toLowerCase() || ticket.booking?.Event?.title?.replace(/\s+/g, '-').toLowerCase() || 'evento'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR:', err);
    }
  }, [ticket, token]);

  const handleCancel = useCallback(async () => {
    if (!ticket || !token || !ticket.bookingId) return;
    setCancelLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/bookings/${ticket.bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Error al cancelar');
      }
      showSuccess('Entrada cancelada exitosamente');
      router.reload();
    } catch (err: any) {
      showError(err.message || 'Error al cancelar la entrada');
    } finally {
      setCancelLoading(false);
      setConfirmCancel(false);
    }
  }, [ticket, token, router]);

  if (isLoading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="max-w-lg mx-auto mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="flex justify-center pt-4">
                  <div className="h-64 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (error || !ticket) {
    return (
      <AuthGuard>
        <Layout>
          <div className="max-w-lg mx-auto mt-8 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {error ? 'Error al cargar la entrada' : 'Entrada no encontrada'}
              </p>
              <Link href="/my-tickets">
                <Button variant="secondary">Volver a mis entradas</Button>
              </Link>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  const event = ticket.booking?.Event || ticket.event;

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-lg mx-auto mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Event cancelled banner */}
            {event && (event.status === 'CANCELLED') && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm font-semibold">
                  ⚠️ El evento asociado a esta entrada ha sido cancelado
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Mi Entrada
              </h1>
              <TicketStatus status={ticket.status} />
            </div>

            {event && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {event.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(event.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.location}
                </p>
              </div>
            )}

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  UUID del Ticket
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(ticket.token);
                    showSuccess('UUID copiado al portapapeles');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Copiar
                </button>
              </div>
              <p className="mt-1 text-sm font-mono text-gray-900 dark:text-gray-100 break-all select-all">
                {ticket.token}
              </p>
            </div>

            <div className="flex flex-col items-center mb-6">
              {ticket.status === 'valid' && !qrUrl && (
                <Button onClick={handleShowQr} isLoading={qrLoading}>
                  Mostrar Código QR
                </Button>
              )}

              {qrLoading && (
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
              )}

              {qrUrl && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
                    <img
                      src={qrUrl}
                      alt="Código QR de entrada"
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleDownload} variant="secondary">
                      Descargar
                    </Button>
                    <Button onClick={handleShowQr} variant="secondary">
                      Cerrar QR
                    </Button>
                  </div>
                </div>
              )}

              {ticket.status !== 'valid' && !qrUrl && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    {ticket.status === 'used'
                      ? 'Esta entrada ya fue utilizada'
                      : ticket.status === 'invalidated'
                      ? `Entrada invalidada: ${ticket.invalidationReason || 'Sin motivo'}`
                      : ticket.status === 'expired'
                      ? 'Esta entrada ha expirado'
                      : 'Entrada no disponible'}
                  </p>
                  {ticket.scannedAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Utilizada el: {new Date(ticket.scannedAt).toLocaleString('es-ES')}
                    </p>
                  )}
                  {ticket.validatedBy && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Validada por: {ticket.validatedBy.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {ticket.auditLogs && ticket.auditLogs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Historial
                </h3>
                {ticket.auditLogs.map((log: any) => (
                  <div key={log.id} className="text-xs text-gray-500 dark:text-gray-400 py-1">
                    {log.action === 'TICKET_CREATED' && 'Creada'}
                    {log.action === 'TICKET_VALIDATED' && 'Validada'}
                    {log.action === 'TICKET_INVALIDATED' && 'Invalidada'}
                    {' - '}
                    {new Date(log.createdAt).toLocaleString('es-ES')}
                    {log.user && ` por ${log.user.name}`}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 text-center">
              <Link href="/my-tickets">
                <Button variant="secondary">Volver a Mis Entradas</Button>
              </Link>

              {ticket.status === 'valid' && !confirmCancel && (
                <div>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Cancelar entrada
                  </button>
                </div>
              )}

              {ticket.status === 'valid' && confirmCancel && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="danger"
                    onClick={handleCancel}
                    isLoading={cancelLoading}
                    disabled={cancelLoading}
                  >
                    Sí, cancelar entrada
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmCancel(false)}
                    disabled={cancelLoading}
                  >
                    No, mantener
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
