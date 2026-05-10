import React, { useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '../components/AuthGuard';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import { useMyTickets } from '../lib/queries/useTickets';
import { TicketStatus } from '../components/TicketStatus';

const TABS = [
  { id: '', label: 'Todas' },
  { id: 'valid', label: 'Válidas' },
  { id: 'used', label: 'Usadas' },
  { id: 'invalidated', label: 'Invalidadas' },
  { id: 'expired', label: 'Expiradas' },
];

export default function MyTicketsPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('');
  const { data, isLoading } = useMyTickets(token, activeTab || undefined);

  const tickets = data?.data ?? [];

  return (
    <AuthGuard>
      <Layout>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Mis Entradas
        </h1>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-1 overflow-x-auto" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && tickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {activeTab ? 'No hay entradas con este estado' : 'Aún no tienes entradas'}
            </p>
            <Link href="/events">
              <Button variant="secondary">Explorar Eventos</Button>
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {tickets.map((ticket: any) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {ticket.booking?.Event?.title || 'Evento'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ticket.booking?.Event?.date
                        ? new Date(ticket.booking.Event.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : ''}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ticket.booking?.Event?.location}
                    </p>
                  </div>
                  <TicketStatus status={ticket.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Layout>
    </AuthGuard>
  );
}
