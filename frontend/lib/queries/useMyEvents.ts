import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api';
import type { EventStatusEnum } from './useEvents';

export interface MyEventItem {
  id: number;
  slug?: string;
  title: string;
  description?: string;
  date?: string | null;
  location: string;
  capacity: number;
  status: EventStatusEnum;
  imageUrl?: string;
  price: number;
  organizerId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  reviewCount: number;
  currentBookings: number;
  availableSpots: number;
  totalBookings: number;
  isFavorited: boolean;
  favoriteCount?: number;
  organizer?: { id: number; name: string; email?: string } | null;
  category?: { id: number; name: string; color: string } | null;
  bookingId?: number;
  bookingStatus?: string;
  bookingQuantity?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface EventsListResponse {
  success: boolean;
  data: MyEventItem[];
  pagination: PaginationInfo;
}

interface SummaryResponse {
  success: boolean;
  data: {
    upcoming: { events: MyEventItem[]; total: number };
    past: { events: MyEventItem[]; total: number };
    favorites: { events: MyEventItem[]; total: number };
    organized: { events: MyEventItem[]; total: number };
  };
}

export function useMyEventsSummary(token: string | null) {
  return useQuery({
    queryKey: ['my-events-summary'],
    queryFn: () => apiFetch<SummaryResponse>('/api/users/my-events-summary', { token: token! }),
    enabled: !!token,
    staleTime: 30_000,
    gcTime: 300_000,
  });
}

export function useMyUpcomingEvents(token: string | null, page: number, limit: number = 12) {
  return useQuery({
    queryKey: ['my-upcoming-events', page, limit],
    queryFn: () => apiFetch<EventsListResponse>(`/api/users/my-upcoming-events?page=${page}&limit=${limit}`, { token: token! }),
    enabled: !!token,
    staleTime: 30_000,
    gcTime: 300_000,
  });
}

export function useMyPastEvents(token: string | null, page: number, limit: number = 12) {
  return useQuery({
    queryKey: ['my-past-events', page, limit],
    queryFn: () => apiFetch<EventsListResponse>(`/api/users/my-past-events?page=${page}&limit=${limit}`, { token: token! }),
    enabled: !!token,
    staleTime: 30_000,
    gcTime: 300_000,
  });
}

export function useMyFavoriteEvents(token: string | null, page: number, limit: number = 12) {
  return useQuery({
    queryKey: ['my-favorite-events', page, limit],
    queryFn: () => apiFetch<EventsListResponse>(`/api/users/my-favorite-events?page=${page}&limit=${limit}`, { token: token! }),
    enabled: !!token,
    staleTime: 30_000,
    gcTime: 300_000,
  });
}

export function useMyOrganizedEvents(token: string | null, page: number, limit: number = 12) {
  return useQuery({
    queryKey: ['my-organized-events', page, limit],
    queryFn: () => apiFetch<EventsListResponse>(`/api/users/my-organized-events?page=${page}&limit=${limit}`, { token: token! }),
    enabled: !!token,
    staleTime: 30_000,
    gcTime: 300_000,
  });
}
