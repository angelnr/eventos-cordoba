import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const { user, resendVerification } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verificando tu email...');
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token || typeof token !== 'string') return;

    const verifyEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('¡Email verificado correctamente!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al verificar el email');
        }
      } catch {
        setStatus('error');
        setMessage('Error al conectar con el servidor');
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async () => {
    if (!user?.email) return;
    setResendSent(true);
    await resendVerification(user.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Verificación de Email
          </h2>
        </div>

        {status === 'verifying' && (
          <div className="text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="rounded-full h-16 w-16 bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 dark:text-green-400 mb-6">{message}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="rounded-full h-16 w-16 bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 mb-6">{message}</p>
            <div className="space-y-3">
              {user && !resendSent && (
                <button
                  onClick={handleResend}
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reenviar correo de verificación
                </button>
              )}
              {resendSent && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Si tu email existe, recibirás un nuevo correo de verificación.
                </p>
              )}
              <div>
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  Volver a iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
