import React, { useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '../components/AuthGuard';
import { Layout } from '../components/Layout';
import { MyEventsTabs } from '../components/MyEventsTabs';
import EventCard from '../components/EventCard';
import Pagination from '../components/filters/Pagination';
import { useAuth } from '../lib/auth';
import {
  useMyEventsSummary,
  useMyUpcomingEvents,
  useMyPastEvents,
  useMyFavoriteEvents,
  useMyOrganizedEvents,
} from '../lib/queries/useMyEvents';
import type { MyEventItem } from '../lib/queries/useMyEvents';

const TAB_UPCOMING = 'upcoming';
const TAB_PAST = 'past';
const TAB_FAVORITES = 'favorites';
const TAB_ORGANIZED = 'organized';

function TabContent({
  activeTab,
  token,
  summaryEvents,
}: {
  activeTab: string;
  token: string | null;
  summaryEvents: Record<string, MyEventItem[]>;
}) {
  const [page, setPage] = useState(1);
  const limit = 12;

  const upcomingQuery = useMyUpcomingEvents(token, activeTab === TAB_UPCOMING ? page : 1, limit);
  const pastQuery = useMyPastEvents(token, activeTab === TAB_PAST ? page : 1, limit);
  const favoritesQuery = useMyFavoriteEvents(token, activeTab === TAB_FAVORITES ? page : 1, limit);
  const organizedQuery = useMyOrganizedEvents(token, activeTab === TAB_ORGANIZED ? page : 1, limit);

  const queries: Record<string, typeof upcomingQuery> = {
    [TAB_UPCOMING]: upcomingQuery,
    [TAB_PAST]: pastQuery,
    [TAB_FAVORITES]: favoritesQuery,
    [TAB_ORGANIZED]: organizedQuery,
  };

  const emptyMessages: Record<string, { title: string; cta?: { text: string; href: string } }> = {
    [TAB_UPCOMING]: {
      title: 'No tienes eventos próximos',
      cta: { text: 'Explorar eventos', href: '/events' },
    },
    [TAB_PAST]: {
      title: 'Aún no tienes eventos pasados',
    },
    [TAB_FAVORITES]: {
      title: 'Aún no tienes eventos favoritos',
      cta: { text: 'Explorar eventos', href: '/events' },
    },
    [TAB_ORGANIZED]: {
      title: 'No has organizado ningún evento',
      cta: { text: 'Crear evento', href: '/events/create' },
    },
  };

  const tabLabels: Record<string, string> = {
    [TAB_UPCOMING]: 'próximos',
    [TAB_PAST]: 'pasados',
    [TAB_FAVORITES]: 'favoritos',
    [TAB_ORGANIZED]: 'organizados',
  };

  const activeQuery = queries[activeTab];
  const { data: queryData, isLoading, isFetching, error } = activeQuery;

  const events = queryData?.data ?? summaryEvents[activeTab] ?? [];
  const pagination = queryData?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">
          Error al cargar eventos {tabLabels[activeTab]}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    const empty = emptyMessages[activeTab];
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          {empty.title}
        </div>
        {empty.cta && (
          <div className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            <Link href={empty.cta.href} className="text-blue-600 dark:text-blue-400 hover:underline">
              {empty.cta.text}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
          />
        ))}
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          limit={pagination.limit}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}

export default function MyEventsPage() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState(TAB_UPCOMING);
  const { data: summaryResponse, isLoading: summaryLoading } = useMyEventsSummary(token);

  const summary = summaryResponse?.data;

  const canOrganize = user?.role === 'organizer' || user?.role === 'admin';

  const tabs = [
    { id: TAB_UPCOMING, label: 'Próximos', count: summary?.upcoming?.total },
    { id: TAB_PAST, label: 'Pasados', count: summary?.past?.total },
    { id: TAB_FAVORITES, label: 'Favoritos', count: summary?.favorites?.total },
    ...(canOrganize ? [{ id: TAB_ORGANIZED, label: 'Organizados', count: summary?.organized?.total }] : []),
  ];

  const summaryEvents: Record<string, MyEventItem[]> = {
    [TAB_UPCOMING]: summary?.upcoming?.events ?? [],
    [TAB_PAST]: summary?.past?.events ?? [],
    [TAB_FAVORITES]: summary?.favorites?.events ?? [],
    [TAB_ORGANIZED]: summary?.organized?.events ?? [],
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Mis Eventos
              </h1>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Gestiona y visualiza todos tus eventos
              </p>
            </div>
          </div>

          <div className="mt-6">
            <MyEventsTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => {
                setActiveTab(tabId);
              }}
            />
          </div>

          <div className="mt-6">
            {summaryLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <TabContent
                activeTab={activeTab}
                token={token}
                summaryEvents={summaryEvents}
              />
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
