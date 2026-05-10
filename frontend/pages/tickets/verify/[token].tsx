import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { Button } from '../../../components/ui/Button';
import { getApiUrl } from '../../../lib/api';

interface VerifyData {
  status: string;
  scannedAt: string | null;
  invalidationReason: string | null;
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
  };
}

export default function VerifyTicketPage() {
  const router = useRouter();
  const { token } = router.query;
  const [data, setData] = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token || typeof token !== 'string') return;

    const fetchStatus = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/tickets/verify/${encodeURIComponent(token)}`);
        const json = await response.json();

        if (!response.ok) {
          setErrorMsg(json.error || 'Error al verificar entrada');
        } else {
          setData(json.data);
        }
      } catch (err) {
        setErrorMsg('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [token]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'valid':
        return { label: 'Válida', color: 'text-green-600', bg: 'bg-green-100' };
      case 'used':
        return { label: 'Utilizada', color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'invalidated':
        return { label: 'Invalidada', color: 'text-red-600', bg: 'bg-red-100' };
      case 'expired':
        return { label: 'Expirada', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      default:
        return { label: status, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Verificación de Entrada
          </h1>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          )}

          {errorMsg && (
            <div>
              <p className="text-red-500 dark:text-red-400 mb-4">{errorMsg}</p>
              <Link href="/">
                <Button variant="secondary">Volver al inicio</Button>
              </Link>
            </div>
          )}

          {data && !loading && (
            <div>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getStatusConfig(data.status).bg} ${getStatusConfig(data.status).color} mb-4`}>
                {getStatusConfig(data.status).label}
              </div>

              <div className="mt-4">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {data.event?.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {data.event?.date
                    ? new Date(data.event.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : ''}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {data.event?.location}
                </p>
              </div>

              {data.scannedAt && (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <p>Validada el: {new Date(data.scannedAt).toLocaleString('es-ES')}</p>
                </div>
              )}

              {data.invalidationReason && (
                <div className="mt-4 text-sm text-red-500 dark:text-red-400">
                  <p>Motivo: {data.invalidationReason}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Link href="/">
              <Button variant="secondary">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
