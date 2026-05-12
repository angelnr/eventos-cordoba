import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api';

export interface StaffEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  price: number;
  status: 'SCHEDULED' | 'FULL';
  imageUrl?: string;
}

export function useStaffTodayEvents(token: string | null) {
  return useQuery({
    queryKey: ['staff-today-events'],
    queryFn: () =>
      apiFetch<{ success: boolean; data: StaffEvent[] }>('/api/events/my-events-today', {
        token: token || undefined,
      }),
    enabled: !!token,
  });
}
