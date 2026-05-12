import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { showSuccess } from '../lib/notifications';

export default function VerificationBanner() {
  const { user, resendVerification } = useAuth();
  const [resending, setResending] = useState(false);

  if (!user || user.isVerified) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification(user.email);
      showSuccess('Si el email existe, recibirás un correo de verificación');
    } catch {
      // Silently fail
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3 text-center">
      <span className="text-yellow-800 dark:text-yellow-200 text-sm">
        Tu email aún no está verificado.{' '}
        <button
          onClick={handleResend}
          disabled={resending}
          className="underline font-medium hover:text-yellow-600 disabled:opacity-50"
        >
          {resending ? 'Enviando...' : 'Reenviar correo'}
        </button>
      </span>
    </div>
  );
}
