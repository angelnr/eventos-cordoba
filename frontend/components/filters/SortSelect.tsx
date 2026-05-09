import React from 'react';

interface SortSelectProps {
  sortBy: string;
  sortOrder: string;
  onChange: (sortBy: string, sortOrder: string) => void;
}

const OPTIONS = [
  { label: 'Fecha (próximos)', sortBy: 'date', sortOrder: 'asc' },
  { label: 'Fecha (antiguos)', sortBy: 'date', sortOrder: 'desc' },
  { label: 'Precio (menor)', sortBy: 'price', sortOrder: 'asc' },
  { label: 'Precio (mayor)', sortBy: 'price', sortOrder: 'desc' },
  { label: 'Mejor valorados', sortBy: 'averageRating', sortOrder: 'desc' },
  { label: 'Más recientes', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'A-Z', sortBy: 'title', sortOrder: 'asc' },
];

export default function SortSelect({ sortBy, sortOrder, onChange }: SortSelectProps) {
  const currentValue = OPTIONS.find(o => o.sortBy === sortBy && o.sortOrder === sortOrder);
  const currentLabel = currentValue?.label || 'Ordenar por';

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-gray-600 hidden sm:inline">
        Ordenar:
      </label>
      <select
        id="sort-select"
        value={`${sortBy}-${sortOrder}`}
        onChange={e => {
          const [newSortBy, newSortOrder] = e.target.value.split('-');
          onChange(newSortBy, newSortOrder);
        }}
        className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {OPTIONS.map(opt => (
          <option key={`${opt.sortBy}-${opt.sortOrder}`} value={`${opt.sortBy}-${opt.sortOrder}`}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
