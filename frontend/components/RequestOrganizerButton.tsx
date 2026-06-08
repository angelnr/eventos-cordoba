import React from 'react';
import { useRequestOrganizer } from '../lib/queries/useRequestOrganizer';
import { showSuccess, showWarning } from '../lib/notifications';

interface RequestOrganizerButtonProps {
  token: string | null;
}

export const RequestOrganizerButton: React.FC<RequestOrganizerButtonProps> = ({ token }) => {
  const mutation = useRequestOrganizer(token);

  const handleClick = () => {
    if (!token) {
      showWarning('Debes iniciar sesión para solicitar ser organizador.');
      return;
    }
    mutation.mutate(undefined, {
      onSuccess: () => {
        showSuccess('Solicitud enviada. Revisaremos tu petición y te contactaremos por email.');
      },
      onError: (error: any) => {
        showWarning(error?.message || 'No se pudo enviar la solicitud. Inténtalo más tarde.');
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={mutation.isPending}
      className="flex items-center w-full px-4 py-2 text-sm text-purple-700 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {mutation.isPending ? (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )}
      {mutation.isPending ? 'Enviando...' : 'Solicitar ser Organizador'}
    </button>
  );
};
