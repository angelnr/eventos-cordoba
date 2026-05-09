import React, { useState, useEffect } from 'react';
import type { EventFilters } from '../../lib/useEventFilters';
import { useDebounce } from '../../lib/useDebounce';
import { Button } from '../ui/Button';
import DatePresetFilter from './DatePresetFilter';
import PriceRangeFilter from './PriceRangeFilter';
import RatingFilter from './RatingFilter';
import AvailabilityFilter from './AvailabilityFilter';
import SortSelect from './SortSelect';
import ActiveFilters from './ActiveFilters';

interface FilterBarProps {
  filters: EventFilters;
  categories?: { id: number; name: string }[];
  priceMin: number;
  priceMax: number;
  totalAvailableEvents?: number;
  totalSoldOutEvents?: number;
  totalFreeEvents?: number;
  onSetFilters: (updates: Partial<EventFilters>) => void;
  onRemoveFilter: (key: keyof EventFilters) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

export default function FilterBar({
  filters,
  categories,
  priceMin,
  priceMax,
  totalAvailableEvents,
  totalSoldOutEvents,
  totalFreeEvents,
  onSetFilters,
  onRemoveFilter,
  onResetFilters,
  activeFilterCount,
}: FilterBarProps) {
  const [showMobile, setShowMobile] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      onSetFilters({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (!filters.search) {
      setSearchInput('');
    }
  }, [filters.search]);

  const content = (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div>
        <label htmlFor="search-input" className="text-sm font-medium text-gray-700">
          Buscar eventos
        </label>
        <input
          id="search-input"
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Buscar por título, descripción..."
          className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Categorías */}
      {categories && categories.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700">Categoría</label>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button
              variant={!filters.category ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onSetFilters({ category: undefined })}
            >
              Todas
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={filters.category === cat.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onSetFilters({ category: cat.id })}
                style={filters.category === cat.id ? { backgroundColor: cat.color } : { borderColor: cat.color }}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Presets de fecha */}
      <div>
        <label className="text-sm font-medium text-gray-700">Fecha</label>
        <div className="mt-1">
          <DatePresetFilter
            value={filters.datePreset}
            onChange={preset => onSetFilters({ datePreset: preset as EventFilters['datePreset'] })}
          />
        </div>
      </div>

      {/* Rango de precio */}
      <PriceRangeFilter
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        priceMin={priceMin}
        priceMax={priceMax}
        onChange={(min, max) => onSetFilters({ minPrice: min, maxPrice: max })}
        onFreeToggle={() => onSetFilters({ isFree: !filters.isFree })}
        isFree={filters.isFree}
      />

      {/* Rating */}
      <RatingFilter
        value={filters.minRating}
        onChange={rating => onSetFilters({ minRating: rating })}
      />

      {/* Disponibilidad */}
      <AvailabilityFilter
        available={filters.available}
        soldOut={filters.soldOut}
        isFree={filters.isFree}
        onChange={updates => onSetFilters(updates)}
        totalAvailableEvents={totalAvailableEvents}
        totalSoldOutEvents={totalSoldOutEvents}
        totalFreeEvents={totalFreeEvents}
      />

      {/* Ordenación */}
      <SortSelect
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onChange={(sortBy, sortOrder) =>
          onSetFilters({ sortBy: sortBy as EventFilters['sortBy'], sortOrder: sortOrder as EventFilters['sortOrder'] })
        }
      />
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block mb-6 p-4 bg-white border rounded-lg">
        <ActiveFilters
          filters={filters}
          categories={categories}
          onRemove={onRemoveFilter}
          onReset={onResetFilters}
          activeCount={activeFilterCount}
        />
        {content}
      </div>

      {/* Mobile trigger */}
      <div className="md:hidden mb-4">
        <ActiveFilters
          filters={filters}
          categories={categories}
          onRemove={onRemoveFilter}
          onReset={onResetFilters}
          activeCount={activeFilterCount}
        />
        <Button
          variant="secondary"
          onClick={() => setShowMobile(true)}
          className="w-full"
        >
          Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {/* Mobile drawer */}
      {showMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobile(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-4 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button
                onClick={() => setShowMobile(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
                aria-label="Cerrar filtros"
              >
                &times;
              </button>
            </div>
            {content}
            <div className="mt-6 flex gap-2">
              <Button variant="primary" onClick={() => setShowMobile(false)} className="flex-1">
                Aplicar filtros
              </Button>
              <Button variant="secondary" onClick={() => { onResetFilters(); setShowMobile(false); }} className="flex-1">
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
