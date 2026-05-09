import React, { useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../lib/auth';
import { useEventFilters } from '../lib/useEventFilters';
import { useEvents, useFiltersMeta } from '../lib/queries/useEvents';
import FilterBar from '../components/filters/FilterBar';
import Pagination from '../components/filters/Pagination';
import SkeletonLoader from '../components/filters/SkeletonLoader';
import EventCard from '../components/EventCard';
import type { EventResponse } from '../lib/queries/useEvents';

export default function Events() {
  const { token } = useAuth();
  const { filters, setFilters, removeFilter, resetFilters, activeFilterCount } = useEventFilters();
  const { data: response, isLoading, isFetching, error } = useEvents(filters, token ?? undefined);
  const { data: metaResponse } = useFiltersMeta();

  const events = response?.data ?? [];
  const pagination = response?.pagination;
  const meta = metaResponse?.data;

  const [favoriteUpdates, setFavoriteUpdates] = useState<Record<number, { isFavorited: boolean; favoriteCount: number }>>({});

  const handleFavoriteToggle = useCallback((eventId: number, nowFavorited: boolean) => {
    setFavoriteUpdates(prev => {
      const event = events.find(e => e.id === eventId);
      const currentCount = favoriteUpdates[eventId]?.favoriteCount ?? event?.favoriteCount ?? 0;
      return {
        ...prev,
        [eventId]: {
          isFavorited: nowFavorited,
          favoriteCount: nowFavorited ? currentCount + 1 : Math.max(0, currentCount - 1),
        },
      };
    });
  }, [events, favoriteUpdates]);

  const getEventWithFavorites = (event: EventResponse): EventResponse => {
    const update = favoriteUpdates[event.id];
    if (update) {
      return { ...event, ...update };
    }
    return event;
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
            <p className="mt-2 text-sm text-gray-700">
              Descubre todos los eventos disponibles en Córdoba
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6">
          <FilterBar
            filters={filters}
            categories={meta?.categories}
            priceMin={meta?.priceRange.min ?? 0}
            priceMax={meta?.priceRange.max ?? 0}
            totalAvailableEvents={meta?.totalAvailableEvents}
            totalSoldOutEvents={meta?.totalSoldOutEvents}
            totalFreeEvents={meta?.totalFreeEvents}
            onSetFilters={setFilters}
            onRemoveFilter={removeFilter}
            onResetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">
              Error al cargar eventos
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline text-sm"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading state */}
        {(isLoading || isFetching) && !error && (
          <SkeletonLoader count={filters.limit} />
        )}

        {/* Empty state */}
        {!isLoading && !isFetching && !error && events.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No se encontraron eventos con estos filtros
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {activeFilterCount > 0 ? (
                <button
                  onClick={resetFilters}
                  className="text-blue-600 hover:underline"
                >
                  Limpiar filtros
                </button>
              ) : (
                'No hay eventos disponibles actualmente'
              )}
            </div>
          </div>
        )}

        {/* Events grid */}
        {!isLoading && !error && events.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={getEventWithFavorites(event)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
                onPageChange={page => {
                  setFilters({ page });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
