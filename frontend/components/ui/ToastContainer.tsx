import { useEffect, useState, useCallback } from 'react';
import { getToasts, subscribe, dismissToast, ToastItem } from '@/lib/notifications';

const ICONS: Record<string, string> = {
  success: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
  error: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
  warning: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
  info: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>',
};

function Toast({ toast, onClose }: { toast: ToastItem; onClose: (id: string) => void }) {
  const [progressWidth, setProgressWidth] = useState(100);

  useEffect(() => {
    if (typeof toast.autoClose !== 'number' || toast.autoClose === false || toast.autoClose <= 0) return;

    setProgressWidth(100);

    const duration = toast.autoClose;
    const startTime = Date.now();

    const frame = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgressWidth(remaining);

      if (remaining > 0) {
        rafId = requestAnimationFrame(frame);
      }
    };

    let rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [toast.autoClose, toast.id]);

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div
      className={`toast toast--${toast.type}${isDark ? ' dark' : ''}${toast.exiting ? ' toast--exit' : ''}`}
      role="alert"
      aria-live="polite"
    >
      {toast.type === 'loading' ? (
        <div className="toast__spinner" />
      ) : (
        <span
          className="toast__icon"
          dangerouslySetInnerHTML={{ __html: ICONS[toast.type] || ICONS.info }}
        />
      )}
      <div className="toast__content">{toast.message}</div>
      {toast.type !== 'loading' && (
        <button
          className="toast__close"
          onClick={() => onClose(toast.id)}
          aria-label="Cerrar notificación"
          type="button"
        >
          ×
        </button>
      )}
      {typeof toast.autoClose === 'number' && toast.autoClose > 0 && toast.type !== 'loading' && (
        <div
          className="toast__progress"
          style={{
            width: `${progressWidth}%`,
            animationDuration: `${toast.autoClose}ms`,
          }}
        />
      )}
    </div>
  );
}

export default function ToastContainer() {
  const [toastList, setToastList] = useState<ToastItem[]>(getToasts);

  useEffect(() => {
    return subscribe(() => {
      setToastList(getToasts());
    });
  }, []);

  const handleClose = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    toastList.forEach((toast) => {
      if (typeof toast.autoClose === 'number' && toast.autoClose > 0 && !toast.exiting) {
        const timer = setTimeout(() => {
          dismissToast(toast.id);
        }, toast.autoClose);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toastList]);

  return (
    <div className="toast-container">
      {toastList.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={handleClose} />
      ))}
    </div>
  );
}