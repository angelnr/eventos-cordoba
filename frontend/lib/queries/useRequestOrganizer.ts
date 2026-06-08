import { useMutation } from '@tanstack/react-query';

export function useRequestOrganizer(token: string | null) {
  const getApiUrl = () => {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    if (hostname === 'eventoscordoba.xyz') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://eventoscordoba.xyz';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://eventoscordoba.xyz';
  };

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('No autenticado');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/organizer-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la solicitud');
      }
      return data;
    },
  });
}
