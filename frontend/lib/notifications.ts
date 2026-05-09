import { toast, type Id, type ToastContent, type ToastOptions } from 'react-toastify';

const activeToasts = new Set<string>();

function makeToastId(type: string, message: string): string {
  return `${type}:${message}`;
}

export function showSuccess(message: ToastContent, options?: ToastOptions): Id {
  const id = makeToastId('success', String(message));
  if (activeToasts.has(id)) return id;
  activeToasts.add(id);
  return toast.success(message, {
    toastId: id,
    onClose: () => activeToasts.delete(id),
    ...options,
  });
}

export function showError(message: ToastContent, options?: ToastOptions): Id {
  const id = makeToastId('error', String(message));
  if (activeToasts.has(id)) return id;
  activeToasts.add(id);
  return toast.error(message, {
    toastId: id,
    onClose: () => activeToasts.delete(id),
    ...options,
  });
}

export function showWarning(message: ToastContent, options?: ToastOptions): Id {
  const id = makeToastId('warning', String(message));
  if (activeToasts.has(id)) return id;
  activeToasts.add(id);
  return toast.warning(message, {
    toastId: id,
    onClose: () => activeToasts.delete(id),
    ...options,
  });
}

export function showInfo(message: ToastContent, options?: ToastOptions): Id {
  const id = makeToastId('info', String(message));
  if (activeToasts.has(id)) return id;
  activeToasts.add(id);
  return toast.info(message, {
    toastId: id,
    onClose: () => activeToasts.delete(id),
    ...options,
  });
}

export function showLoading(message: ToastContent, options?: ToastOptions): Id {
  const id = makeToastId('loading', String(message));
  return toast.loading(message, {
    toastId: id,
    ...options,
  });
}

export function dismissToast(id: Id): void {
  activeToasts.delete(String(id));
  toast.dismiss(id);
}

export function dismissAll(): void {
  activeToasts.clear();
  toast.dismiss();
}

export function showPromise<T>(
  promise: Promise<T>,
  messages: { pending: string; success: string; error: string },
  options?: ToastOptions
): Promise<T> {
  return toast.promise(promise, messages, options) as Promise<T>;
}

export function handleApiResponse<T>(
  promise: Promise<Response>,
  options?: { successMessage?: string; errorMessage?: string }
): Promise<T | null> {
  return promise
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showError(errorData.error || options?.errorMessage || 'Error en la solicitud');
        return null;
      }
      if (options?.successMessage) {
        showSuccess(options.successMessage);
      }
      return res.json() as Promise<T>;
    })
    .catch(() => {
      showError(options?.errorMessage || 'Error de conexión');
      return null;
    });
}