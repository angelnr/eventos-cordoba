import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api';

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  scope?: 'mine' | 'all';
}

export interface DashboardMetrics {
  totalEvents: number;
  eventsByStatus: Record<string, number>;
  totalAttendees: number;
  averageRating: number;
  eventsWithReviews: number;
  completedEvents: number;
  scope: 'mine' | 'all';
  organizerId: number | null;
  filters: {
    startDate: string | null;
    endDate: string | null;
    statuses: string[] | null;
  };
  computedAt: string;
}

interface DashboardApiResponse {
  success: boolean;
  data: DashboardMetrics;
}

export function useDashboardMetrics(filters: DashboardFilters = {}, token?: string) {
  const params = new URLSearchParams();

  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.status) params.set('status', filters.status);
  if (filters.scope) params.set('scope', filters.scope);

  const queryString = params.toString();
  const queryKey = ['dashboard-metrics', queryString];

  return useQuery<DashboardApiResponse>({
    queryKey,
    queryFn: () => apiFetch(`/api/dashboard/metrics${queryString ? `?${queryString}` : ''}`, { token }),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}
