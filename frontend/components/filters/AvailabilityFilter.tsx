import React from 'react';

interface AvailabilityFilterProps {
  available?: boolean;
  soldOut?: boolean;
  isFree?: boolean;
  onChange: (updates: { available?: boolean; soldOut?: boolean; isFree?: boolean }) => void;
  totalAvailableEvents?: number;
  totalSoldOutEvents?: number;
  totalFreeEvents?: number;
}

export default function AvailabilityFilter({
  available,
  soldOut,
  isFree,
  onChange,
  totalAvailableEvents,
  totalSoldOutEvents,
  totalFreeEvents,
}: AvailabilityFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Disponibilidad</label>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={available || false}
          onChange={() => onChange({ available: !available, soldOut: false })}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        Con plazas {totalAvailableEvents != null && `(${totalAvailableEvents})`}
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={soldOut || false}
          onChange={() => onChange({ soldOut: !soldOut, available: false })}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        Agotados {totalSoldOutEvents != null && `(${totalSoldOutEvents})`}
      </label>
      {totalFreeEvents != null && (
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isFree || false}
            onChange={() => onChange({ isFree: !isFree })}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          Gratuitos ({totalFreeEvents})
        </label>
      )}
    </div>
  );
}
