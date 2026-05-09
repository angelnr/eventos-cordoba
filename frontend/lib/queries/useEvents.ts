import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api';
import type { EventFilters } from '../useEventFilters';

export interface EventResponse {
  id: number;
  slug?: string;
  title: string;
  description?: string;
  date?: string | null;
  location: string;
  capacity: number;
  status: string;
  imageUrl?: string;
  price: number;
  organizerId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  reviewCount: number;
  currentBookings: number;
  organizer?: { id: number; name: string; email?: string } | null;
  category?: { id: number; name: string; color: string } | null;
  availableSpots: number;
  totalBookings: number;
  isFavorited?: boolean;
  favoriteCount?: number;
}

interface EventsApiResponse {
  success: boolean;
  data: EventResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    applied: Record<string, unknown>;
  };
}

interface CategoryMeta {
  id: number;
  name: string;
  color: string;
  eventCount: number;
}

interface FiltersMetaResponse {
  success: boolean;
  data: {
    categories: CategoryMeta[];
    priceRange: { min: number; max: number };
    ratingRange: { min: number; max: number; average: number };
    totalActiveEvents: number;
    totalFreeEvents: number;
    totalAvailableEvents: number;
    totalSoldOutEvents: number;
  };
}

export function useEvents(filters: EventFilters, token?: string) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value != null && value !== '' && value !== false) {
      params.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['events', filters],
    queryFn: () =>
      apiFetch<EventsApiResponse>(`/api/events?${params.toString()}`, { token }),
    staleTime: 30_000,
    gcTime: 300_000,
  });
}

export function useFiltersMeta() {
  return useQuery({
    queryKey: ['filters-meta'],
    queryFn: () => apiFetch<FiltersMetaResponse>('/api/events/filters-meta'),
    staleTime: 60_000,
    gcTime: 600_000,
  });
}
