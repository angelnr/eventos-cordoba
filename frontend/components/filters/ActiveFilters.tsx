import React from 'react';
import type { EventFilters } from '../../lib/useEventFilters';

interface ActiveFiltersProps {
  filters: EventFilters;
  categories?: { id: number; name: string }[];
  onRemove: (key: keyof EventFilters) => void;
  onReset: () => void;
  activeCount: number;
}

const FILTER_LABELS: Record<string, (value: unknown, categories?: { id: number; name: string }[]) => string> = {
  category: (v, cats) => {
    const cat = cats?.find(c => c.id === Number(v));
    return cat ? `Categoría: ${cat.name}` : `Categoría: ${v}`;
  },
  search: (v) => `Buscar: ${v}`,
  datePreset: (v) => {
    const labels: Record<string, string> = {
      today: 'Hoy',
      this_week: 'Esta semana',
      this_weekend: 'Este fin de semana',
      upcoming: 'Próximos',
    };
    return labels[String(v)] || String(v);
  },
  minPrice: (v, _c, filters) => {
    const max = (filters as Record<string, unknown>)?.maxPrice;
    return max != null ? `Precio: ${v}-${max}€` : `Precio: desde ${v}€`;
  },
  maxPrice: (v, _c, filters) => {
    const min = (filters as Record<string, unknown>)?.minPrice;
    return min != null ? '' : `Precio: hasta ${v}€`;
  },
  minRating: (v) => `Rating: ≥${v}★`,
  available: () => 'Con plazas',
  soldOut: () => 'Agotados',
  isFree: () => 'Gratuitos',
  sortBy: (v) => `Orden: ${v}`,
  sortOrder: (v) => v === 'desc' ? 'Orden: descendente' : '',
};

const FILTER_KEYS: (keyof EventFilters)[] = [
  'category', 'search', 'datePreset', 'minPrice', 'maxPrice',
  'minRating', 'available', 'soldOut', 'isFree', 'sortBy', 'sortOrder',
];

export default function ActiveFilters({ filters, categories, onRemove, onReset, activeCount }: ActiveFiltersProps) {
  if (activeCount === 0) return null;

  const activeChips = FILTER_KEYS
    .map(key => {
      const value = filters[key];
      if (value == null || value === '' || value === false) return null;
      const labelFn = FILTER_LABELS[key];
      if (!labelFn) return null;
      const label = labelFn(value, categories, filters);
      if (!label) return null;
      return { key, label };
    })
    .filter(Boolean) as { key: keyof EventFilters; label: string }[];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Filtros activos:</span>
      {activeChips.map(chip => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          aria-label={`Eliminar filtro: ${chip.label}`}
        >
          {chip.label}
          <span className="text-blue-500 hover:text-blue-700 font-bold">&times;</span>
        </button>
      ))}
      {activeCount > 1 && (
        <button
          onClick={onReset}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 underline ml-2"
        >
          Limpiar todo
        </button>
      )}
    </div>
  );
}
