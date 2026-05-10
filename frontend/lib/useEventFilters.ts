import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import type { EventStatusEnum } from './queries/useEvents';

export interface EventFilters {
  page: number;
  limit: number;
  category?: number;
  search?: string;
  datePreset?: 'today' | 'this_week' | 'this_weekend' | 'upcoming';
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  available?: boolean;
  soldOut?: boolean;
  isFree?: boolean;
  status?: EventStatusEnum;
  sortBy: 'date' | 'price' | 'averageRating' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_FILTERS: EventFilters = {
  page: 1,
  limit: 12,
  sortBy: 'date',
  sortOrder: 'asc',
};

export function useEventFilters() {
  const router = useRouter();

  const filters: EventFilters = useMemo(() => {
    const q = router.query;

    return {
      ...DEFAULT_FILTERS,
      ...(q.page && { page: Math.max(1, Number(q.page)) }),
      ...(q.limit && { limit: Math.min(50, Math.max(1, Number(q.limit))) }),
      ...(q.category && { category: Number(q.category) }),
      ...(q.search && { search: String(q.search) }),
      ...(q.datePreset === 'today' || q.datePreset === 'this_week' || q.datePreset === 'this_weekend' || q.datePreset === 'upcoming'
        ? { datePreset: q.datePreset as EventFilters['datePreset'] }
        : {}),
      ...(q.dateFrom && { dateFrom: String(q.dateFrom) }),
      ...(q.dateTo && { dateTo: String(q.dateTo) }),
      ...(q.minPrice != null && { minPrice: Number(q.minPrice) }),
      ...(q.maxPrice != null && { maxPrice: Number(q.maxPrice) }),
      ...(q.minRating != null && { minRating: Number(q.minRating) }),
      ...(q.available === 'true' && { available: true }),
      ...(q.soldOut === 'true' && { soldOut: true }),
      ...(q.isFree === 'true' && { isFree: true }),
      ...(q.status === 'SCHEDULED' || q.status === 'CANCELLED' || q.status === 'FINISHED' || q.status === 'FULL'
        ? { status: q.status as EventStatusEnum }
        : {}),
      ...(q.sortBy === 'price' || q.sortBy === 'averageRating' || q.sortBy === 'createdAt' || q.sortBy === 'title'
        ? { sortBy: q.sortBy as EventFilters['sortBy'] }
        : {}),
      ...(q.sortOrder === 'desc' && { sortOrder: 'desc' as const }),
    };
  }, [router.query]);

  const setFilters = useCallback((updates: Partial<EventFilters>) => {
    const merged = { ...filters, ...updates };

    if (!('page' in updates)) {
      merged.page = 1;
    }

    const params = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value != null && value !== '' && value !== false) {
        params.set(key, String(value));
      }
    });

    router.push(`/events?${params.toString()}`, undefined, { shallow: true });
  }, [router, filters]);

  const resetFilters = useCallback(() => {
    router.push('/events', undefined, { shallow: true });
  }, [router]);

  const removeFilter = useCallback((key: keyof EventFilters) => {
    const newFilters = { ...filters } as Record<string, unknown>;
    delete newFilters[key];
    newFilters.page = 1;

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v != null && v !== '' && v !== false) {
        params.set(k, String(v));
      }
    });

    router.push(`/events?${params.toString()}`, undefined, { shallow: true });
  }, [router, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.search) count++;
    if (filters.datePreset || filters.dateFrom || filters.dateTo) count++;
    if (filters.minPrice != null || filters.maxPrice != null) count++;
    if (filters.minRating != null) count++;
    if (filters.available) count++;
    if (filters.soldOut) count++;
    if (filters.isFree) count++;
    if (filters.status) count++;
    if (filters.sortBy !== 'date') count++;
    if (filters.sortOrder !== 'asc') count++;
    return count;
  }, [filters]);

  return { filters, setFilters, resetFilters, removeFilter, activeFilterCount };
}
