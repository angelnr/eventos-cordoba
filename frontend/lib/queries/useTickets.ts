import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api';

export interface Ticket {
  id: number;
  token: string;
  status: 'valid' | 'used' | 'invalidated' | 'expired';
  bookingId: number;
  scannedAt: string | null;
  createdAt: string;
  validatedById: number | null;
  validatedBy?: { id: number; name: string } | null;
  invalidatedAt?: string | null;
  invalidationReason?: string | null;
  auditLogs?: Array<{
    id: number;
    action: string;
    userId: number | null;
    user?: { id: number; name: string } | null;
    metadata: string | null;
    createdAt: string;
  }>;
  booking?: {
    id: number;
    userId: number;
    eventId: number;
    Event?: {
      id: number;
      title: string;
      date: string;
      location: string;
      imageUrl?: string;
      status: string;
    };
    user?: { id: number; name: string; email: string };
  };
  event?: {
    id: number;
    title: string;
    date: string;
    location: string;
    imageUrl?: string;
    status: string;
  };
}

const API_PREFIX = '/api/tickets';

export function useMyTickets(token: string | null, status?: string) {
  const params = status ? `?status=${encodeURIComponent(status)}` : '';
  return useQuery({
    queryKey: ['my-tickets', status, token],
    queryFn: () =>
      apiFetch<{ success: boolean; data: Ticket[] }>(`${API_PREFIX}/my-tickets${params}`, {
        token: token || undefined,
      }),
    enabled: !!token,
  });
}

export function useTicket(ticketId: number, token: string | null) {
  return useQuery({
    queryKey: ['ticket', ticketId, token],
    queryFn: () =>
      apiFetch<{ success: boolean; data: Ticket }>(`${API_PREFIX}/${ticketId}`, {
        token: token || undefined,
      }),
    enabled: !!ticketId && !!token,
  });
}

export function useGenerateTicket(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: number) =>
      apiFetch<{ success: boolean; data: Ticket }>(`${API_PREFIX}/generate/${bookingId}`, {
        method: 'POST',
        token: token || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}

export function useValidateTicket(token: string | null) {
  return useMutation({
    mutationFn: ({ ticketToken, eventId }: { ticketToken: string; eventId: number }) =>
      apiFetch<{ success: boolean; action: string; data?: any; error?: string }>(`${API_PREFIX}/validate`, {
        method: 'POST',
        body: JSON.stringify({ token: ticketToken, eventId }),
        token: token || undefined,
      }),
  });
}
