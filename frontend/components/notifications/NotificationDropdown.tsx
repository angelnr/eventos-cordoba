import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteReadNotifications,
  useUnreadCount,
} from '../../lib/queries/useNotifications';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '../../lib/queries/useNotifications';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { token } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [readingIds, setReadingIds] = useState<Set<number>>(new Set());

  const { data, isLoading, isError, refetch } = useNotifications(token, { page, unreadOnly: false });
  const { data: unreadData } = useUnreadCount(token);
  const markAsRead = useMarkAsRead(token);
  const markAllAsRead = useMarkAllAsRead(token);
  const deleteNotification = useDeleteNotification(token);
  const deleteRead = useDeleteReadNotifications(token);

  const unreadCount = unreadData?.data?.unreadCount ?? 0;
  const notifications = data?.data ?? [];
  const pagination = data?.pagination;

  const handleMarkAsRead = useCallback((id: number) => {
    setReadingIds(prev => new Set(prev).add(id));
    markAsRead.mutate(id, {
      onSettled: () => {
        setReadingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  }, [markAsRead]);

  const handleDelete = useCallback((id: number) => {
    deleteNotification.mutate(id);
  }, [deleteNotification]);

  const handleNavigate = useCallback((link: string) => {
    onClose();
    router.push(link);
  }, [onClose, router]);

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNext) {
      setPage(prev => prev + 1);
    }
  }, [pagination?.hasNext]);

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleCleanup = useCallback(() => {
    deleteRead.mutate();
  }, [deleteRead]);

  const hasReadNotifications = notifications.some(n => n.isRead);

  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
      role="menu"
      aria-label="Lista de notificaciones"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                ({unreadCount} sin leer)
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                disabled={markAllAsRead.isPending}
              >
                {markAllAsRead.isPending ? '...' : 'Marcar todas leídas'}
              </button>
            )}
            {hasReadNotifications && (
              <button
                onClick={handleCleanup}
                className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50"
                title="Limpiar leídas"
                disabled={deleteRead.isPending}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {isLoading && page === 1 && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="w-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Error al cargar notificaciones
            </p>
            <button
              onClick={() => refetch()}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="p-8 text-center">
            <svg className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No tienes notificaciones
            </p>
          </div>
        )}

        {notifications.map((n: Notification) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            onNavigate={handleNavigate}
            isMarkingAsRead={readingIds.has(n.id)}
          />
        ))}

        {pagination?.hasNext && (
          <div className="p-3 text-center">
            <button
              onClick={handleLoadMore}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
