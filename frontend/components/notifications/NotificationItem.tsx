import React from 'react';
import type { Notification } from '../../lib/queries/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: (link: string) => void;
  isMarkingAsRead?: boolean;
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

const typeConfig: Record<string, { borderColor: string; iconColor: string; icon: JSX.Element }> = {
  EVENT_CANCELLED: {
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  EVENT_DATE_CHANGED: {
    borderColor: 'border-l-orange-400',
    iconColor: 'text-orange-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  EVENT_REMINDER: {
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  BOOKING_CONFIRMED: {
    borderColor: 'border-l-teal-500',
    iconColor: 'text-teal-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  ORGANIZER_ANNOUNCEMENT: {
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
  isMarkingAsRead,
}) => {
  const config = typeConfig[notification.type] || typeConfig.EVENT_REMINDER;
  const hasLink = !!(notification.link || notification.eventId);
  const targetLink = notification.link || (notification.eventId ? `/events/${notification.eventId}` : null);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (hasLink && targetLink) {
      onNavigate(targetLink);
    }
  };

  return (
    <div
      className={`border-l-4 ${config.borderColor} px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group ${hasLink ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
      role={hasLink ? 'button' : undefined}
      tabIndex={hasLink ? 0 : undefined}
      onKeyDown={(e) => { if (hasLink && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleClick(); } }}
    >
      <div className="flex items-start space-x-3">
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
        )}
        {notification.isRead && (
          <div className="w-2 h-2 flex-shrink-0" />
        )}
        <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {notification.title}
            </p>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap">
              {getRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
            {notification.message}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all flex-shrink-0 p-0.5"
          aria-label="Eliminar notificaci\u00f3n"
          title="Eliminar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {isMarkingAsRead && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded pointer-events-none" />
      )}
    </div>
  );
};
