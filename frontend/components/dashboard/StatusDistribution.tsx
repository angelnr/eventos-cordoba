import React from 'react';

interface StatusDistributionProps {
  eventsByStatus: Record<string, number>;
  totalEvents: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  SCHEDULED: { label: 'Programados', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-500' },
  CANCELLED: { label: 'Cancelados', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-500' },
  FINISHED: { label: 'Finalizados', color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-500' },
  FULL: { label: 'Completos', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-500' },
};

export const StatusDistribution: React.FC<StatusDistributionProps> = ({ eventsByStatus, totalEvents }) => {
  if (totalEvents === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">No hay eventos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Distribución por Estado</h3>
      <div className="space-y-3">
        {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
          const count = eventsByStatus[statusKey] || 0;
          const percentage = totalEvents > 0 ? (count / totalEvents) * 100 : 0;
          return (
            <div key={statusKey}>
              <div className="flex justify-between text-sm mb-1">
                <span className={config.color}>{config.label}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`${config.bgColor} rounded-full h-2`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
