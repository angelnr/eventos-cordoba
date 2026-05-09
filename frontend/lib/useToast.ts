import { useCallback } from 'react';
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  dismissToast,
  dismissAll,
  handleApiResponse,
} from './notifications';

export function useToast() {
  const success = useCallback((message: string) => showSuccess(message), []);
  const error = useCallback((message: string) => showError(message), []);
  const warning = useCallback((message: string) => showWarning(message), []);
  const info = useCallback((message: string) => showInfo(message), []);
  const loading = useCallback((message: string) => showLoading(message), []);
  const dismiss = useCallback((id: string) => dismissToast(id), []);
  const dismissAllToasts = useCallback(() => dismissAll(), []);

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll: dismissAllToasts,
    handleApiResponse,
  };
}