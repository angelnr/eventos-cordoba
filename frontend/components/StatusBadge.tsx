import React from 'react';

export type EventStatusEnum = 'SCHEDULED' | 'CANCELLED' | 'FINISHED' | 'FULL';

const STATUS_CONFIG: Record<EventStatusEnum, {
  label: string;
  color: string;
  bg: string;
  borderColor: string;
  icon: string;
}> = {
  SCHEDULED: {
    label: 'Programado',
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: '\u2713',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '\u2715',
  },
  FINISHED: {
    label: 'Finalizado',
    color: 'text-gray-600 dark:text-gray-300',
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    borderColor: 'border-gray-200 dark:border-gray-700',
    icon: '\u25FC',
  },
  FULL: {
    label: 'Completo',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: '\u25C9',
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function StatusBadge({ status, size = 'md', showIcon = true }: {
  status: EventStatusEnum;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.bg} ${config.color} ${config.borderColor} ${sizeClass}`}
      role="status"
      aria-label={`Estado del evento: ${config.label}`}
    >
      {showIcon && <span aria-hidden="true">{config.icon}</span>}
      {config.label}
    </span>
  );
}

export function getStatusConfig(status: EventStatusEnum) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
}

export function canBookByStatus(status: EventStatusEnum): boolean {
  return status === 'SCHEDULED';
}

export function canFavoriteByStatus(status: EventStatusEnum): boolean {
  return status !== 'CANCELLED';
}
