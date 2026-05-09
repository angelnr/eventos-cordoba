import React from 'react';

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  priceMin: number;
  priceMax: number;
  onChange: (min?: number, max?: number) => void;
  onFreeToggle: () => void;
  isFree?: boolean;
}

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  priceMin,
  priceMax,
  onChange,
  onFreeToggle,
  isFree,
}: PriceRangeFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Precio</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder={String(priceMin)}
          value={minPrice ?? ''}
          onChange={e => onChange(
            e.target.value ? Number(e.target.value) : undefined,
            maxPrice
          )}
          className="w-20 px-2 py-1 border rounded text-sm"
          min={priceMin}
          max={priceMax}
          aria-label="Precio mínimo"
        />
        <span className="text-gray-400 dark:text-gray-500">—</span>
        <input
          type="number"
          placeholder={String(priceMax)}
          value={maxPrice ?? ''}
          onChange={e => onChange(
            minPrice,
            e.target.value ? Number(e.target.value) : undefined
          )}
          className="w-20 px-2 py-1 border rounded text-sm"
          min={priceMin}
          max={priceMax}
          aria-label="Precio máximo"
        />
        <span className="text-sm text-gray-500 dark:text-gray-400">€</span>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={isFree || false}
          onChange={onFreeToggle}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        Solo gratuitos
      </label>
    </div>
  );
}
