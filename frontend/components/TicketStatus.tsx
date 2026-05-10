import React from 'react';

interface TicketStatusProps {
  status: 'valid' | 'used' | 'invalidated' | 'expired';
}

const STATUS_CONFIG: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
  valid: {
    label: 'Válida',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-800 dark:text-green-400',
    icon: '✓',
  },
  used: {
    label: 'Utilizada',
    bgClass: 'bg-gray-100 dark:bg-gray-700',
    textClass: 'text-gray-800 dark:text-gray-300',
    icon: '✗',
  },
  invalidated: {
    label: 'Invalidada',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-800 dark:text-red-400',
    icon: '✗',
  },
  expired: {
    label: 'Expirada',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-800 dark:text-yellow-400',
    icon: '⏰',
  },
};

export const TicketStatus: React.FC<TicketStatusProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgClass} ${config.textClass}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};
