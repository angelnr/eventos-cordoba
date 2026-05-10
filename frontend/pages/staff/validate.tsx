import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthGuard } from '../../components/AuthGuard';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { useValidateTicket } from '../../lib/queries/useTickets';
import { showSuccess, showError } from '../../lib/notifications';
import { TicketScanner } from '../../components/TicketScanner';

type ValidationState = 'idle' | 'validating' | 'success' | 'already_used' | 'error';

export default function StaffValidatePage() {
  const { user, token } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [state, setState] = useState<ValidationState>('idle');
  const [resultData, setResultData] = useState<any>(null);
  const validateMutation = useValidateTicket(token);
  const inputRef = useRef<HTMLInputElement>(null);

  const isStaff = user?.role === 'staff' || user?.role === 'organizer' || user?.role === 'admin';

  const handleScan = useCallback((scannedToken: string) => {
    setTokenInput(scannedToken);
    const validate = async () => {
      setState('validating');
      try {
        const res = await validateMutation.mutateAsync(scannedToken);
        setResultData(res);
        if (res.action === 'validated') { setState('success'); showSuccess('Entrada validada'); }
        else if (res.action === 'already_used') { setState('already_used'); showError('Entrada ya utilizada'); }
        else { setState('error'); showError(res.error || 'Error'); }
      } catch (err: any) {
        if (err.status === 404) { setState('error'); showError('Entrada no encontrada'); }
        else if (err.status === 422) { setState('error'); showError('Entrada invalidada'); }
        else if (err.status === 410) { setState('error'); showError('Entrada expirada'); }
        else { setState('error'); showError(err.message || 'Error de conexión'); }
      }
    };
    validate();
  }, [validateMutation]);

  useEffect(() => {
    if (state !== 'idle') {
      const timer = setTimeout(() => {
        setTokenInput('');
        setState('idle');
        setResultData(null);
        inputRef.current?.focus();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleValidate = async () => {
    if (!tokenInput.trim()) return;

    setState('validating');
    try {
      const res = await validateMutation.mutateAsync(tokenInput.trim());
      setResultData(res);

      if (res.action === 'validated') {
        setState('success');
        showSuccess('Entrada validada correctamente');
      } else if (res.action === 'already_used') {
        setState('already_used');
        showError('Esta entrada ya fue utilizada');
      } else {
        setState('error');
        showError(res.error || 'Error al validar');
      }
    } catch (err: any) {
      if (err.status === 404) {
        setState('error');
        showError('Entrada no encontrada');
      } else if (err.status === 422) {
        setState('error');
        showError('Entrada invalidada');
      } else if (err.status === 410) {
        setState('error');
        showError('Entrada expirada');
      } else {
        setState('error');
        showError(err.message || 'Error de conexión');
      }
    }
  };

  if (!isStaff) {
    return (
      <AuthGuard>
        <Layout>
          <div className="max-w-md mx-auto mt-8 text-center">
            <p className="text-red-500 dark:text-red-400">
              No tienes permisos para acceder a esta página.
            </p>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-md mx-auto mt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Validar Entrada
          </h1>

          <TicketScanner onScan={handleScan} disabled={state === 'validating'} />

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <label
              htmlFor="token-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              O introduce manualmente el código
            </label>
            <input
              id="token-input"
              ref={inputRef}
              type="text"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                if (state !== 'idle') {
                  setState('idle');
                  setResultData(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleValidate();
              }}
              placeholder="Ej: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={state === 'validating'}
              autoFocus
            />

            <Button
              onClick={handleValidate}
              isLoading={state === 'validating'}
              fullWidth
              className="mt-4"
              disabled={!tokenInput.trim() || state === 'validating'}
            >
              Validar Entrada
            </Button>
          </div>

          {state === 'success' && resultData?.data && (
            <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-green-700 dark:text-green-400 font-semibold text-lg">
                ✓ Entrada Válida
              </p>
              <p className="text-green-600 dark:text-green-400 mt-1">
                {resultData.data.user?.name}
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm">
                {resultData.data.event?.title}
              </p>
            </div>
          )}

          {state === 'already_used' && resultData?.data && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-700 dark:text-yellow-400 font-semibold">
                ⚠ Entrada ya utilizada
              </p>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                {resultData.data.user?.name}
              </p>
              {resultData.data.ticket?.scannedAt && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                  Validada el: {new Date(resultData.data.ticket.scannedAt).toLocaleString('es-ES')}
                </p>
              )}
              {resultData.data.ticket?.validatedBy && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                  Por: {resultData.data.ticket.validatedBy.name}
                </p>
              )}
            </div>
          )}

          {state === 'error' && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400 font-semibold">
                ✗ Entrada no válida
              </p>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
