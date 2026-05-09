import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '../api';
import { queryClient } from '../queryClient';

export type NotificationType =
  | 'EVENT_CANCELLED'
  | 'EVENT_DATE_CHANGED'
  | 'EVENT_REMINDER'
  | 'ORGANIZER_ANNOUNCEMENT'
  | 'BOOKING_CONFIRMED';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  eventId: number | null;
  isRead: boolean;
  userId: number;
  createdAt: string;
  event?: {
    id: number;
    title: string;
    slug?: string;
  } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: PaginationInfo;
  unreadCount: number;
}

interface UnreadCountResponse {
  success: boolean;
  data: { unreadCount: number };
}

interface UpdatedCountResponse {
  success: boolean;
  data: { updatedCount: number };
}

interface DeletedCountResponse {
  success: boolean;
  data: { deletedCount: number };
}

export function useUnreadCount(token: string | null) {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () =>
      apiFetch<UnreadCountResponse>('/api/notifications/unread-count', { token: token || undefined }),
    enabled: !!token,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
  });
}

interface UseNotificationsOptions {
  unreadOnly?: boolean;
  page?: number;
}

export function useNotifications(token: string | null, options?: UseNotificationsOptions) {
  const params = new URLSearchParams();
  if (options?.unreadOnly) params.set('unreadOnly', 'true');
  if (options?.page) params.set('page', String(options.page));

  return useQuery({
    queryKey: ['notifications', 'list', options],
    queryFn: () =>
      apiFetch<NotificationsResponse>(`/api/notifications?${params.toString()}`, { token: token || undefined }),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useMarkAsRead(token: string | null) {
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ success: boolean; data: Notification }>(
        `/api/notifications/${id}/read`,
        { token: token || undefined, method: 'PATCH' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead(token: string | null) {
  return useMutation({
    mutationFn: () =>
      apiFetch<UpdatedCountResponse>(
        '/api/notifications/mark-all-read',
        { token: token || undefined, method: 'PATCH' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification(token: string | null) {
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ success: boolean; message: string }>(
        `/api/notifications/${id}`,
        { token: token || undefined, method: 'DELETE' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteReadNotifications(token: string | null) {
  return useMutation({
    mutationFn: () =>
      apiFetch<DeletedCountResponse>(
        '/api/notifications/read-all',
        { token: token || undefined, method: 'DELETE' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
