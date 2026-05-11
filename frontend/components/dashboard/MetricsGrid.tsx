import React from 'react';
import { MetricCard } from './MetricCard';
import { useDashboardMetrics } from '../../lib/queries/useDashboardMetrics';

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Programados',
  CANCELLED: 'Cancelados',
  FINISHED: 'Finalizados',
  FULL: 'Completos',
};

interface MetricsGridProps {
  startDate?: string;
  endDate?: string;
  status?: string;
  scope?: 'mine' | 'all';
  token?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  startDate,
  endDate,
  status,
  scope,
  token,
}) => {
  const { data, isLoading, error } = useDashboardMetrics({
    startDate,
    endDate,
    status,
    scope,
  }, token);

  const metrics = data?.data;

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">
            Error al cargar métricas. Intenta de nuevo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Eventos Creados"
          value={metrics?.totalEvents ?? '...'}
          subtitle={
            metrics
              ? Object.entries(metrics.eventsByStatus)
                  .filter(([_, c]) => c > 0)
                  .map(([s, c]) => `${statusLabels[s] || s}: ${c}`)
                  .join(' · ')
              : undefined
          }
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          isLoading={isLoading}
          color="blue"
        />
        <MetricCard
          title="Asistentes Totales"
          value={metrics?.totalAttendees ?? '...'}
          subtitle="Check-ins verificados"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.357-2.143M17 20H7m10 0v-2c0-.715-.193-1.385-.543-1.965M7 20H2v-2a3 3 0 015.357-2.143M7 20v-2c0-.715.193-1.385.543-1.965m0 0a5.004 5.004 0 013.9-1.965M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          isLoading={isLoading}
          color="green"
        />
        <MetricCard
          title="Puntuación Media"
          value={metrics?.averageRating ?? '...'}
          subtitle={metrics ? `${metrics.eventsWithReviews} eventos con reviews` : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          isLoading={isLoading}
          color="amber"
        />
        <MetricCard
          title="Eventos Completados"
          value={metrics?.completedEvents ?? '...'}
          subtitle={
            metrics
              ? `Finalizados: ${metrics.eventsByStatus.FINISHED ?? 0} · Completos: ${metrics.eventsByStatus.FULL ?? 0}`
              : undefined
          }
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          isLoading={isLoading}
          color="purple"
        />
      </div>
    </div>
  );
};
