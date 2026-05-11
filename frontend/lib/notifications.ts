export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  autoClose: number | false;
  createdAt: number;
  exiting: boolean;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let toasts: ToastItem[] = [];
let idCounter = 0;

const activeToasts = new Set<string>();

function makeToastId(type: string, message: string): string {
  return `${type}:${message}`;
}

function generateId(): string {
  return `toast-${++idCounter}-${Date.now()}`;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getToasts(): ToastItem[] {
  return toasts;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function addToast(type: ToastType, message: string, options?: { autoClose?: number | false; toastId?: string }): string {
  const dedupeId = makeToastId(type, String(message));

  if (activeToasts.has(dedupeId) && type !== 'loading') {
    const existing = toasts.find((t) => t.id === dedupeId || makeToastId(t.type, t.message) === dedupeId);
    if (existing) return existing.id;
  }

  const id = options?.toastId || generateId();
  activeToasts.add(dedupeId);

  const toast: ToastItem = {
    id,
    type,
    message: String(message),
    autoClose: options?.autoClose !== undefined ? options.autoClose : type === 'loading' ? false : 4000,
    createdAt: Date.now(),
    exiting: false,
  };

  toasts = [...toasts, toast];
  emitChange();
  return id;
}

export function showSuccess(message: string, options?: { autoClose?: number | false }): string {
  return addToast('success', message, options);
}

export function showError(message: string, options?: { autoClose?: number | false }): string {
  return addToast('error', message, { ...options, autoClose: options?.autoClose ?? 5000 });
}

export function showWarning(message: string, options?: { autoClose?: number | false }): string {
  return addToast('warning', message, options);
}

export function showInfo(message: string, options?: { autoClose?: number | false }): string {
  return addToast('info', message, options);
}

export function showLoading(message: string, options?: { autoClose?: number | false }): string {
  return addToast('loading', message, { ...options, autoClose: false });
}

export function dismissToast(id: string): void {
  const toast = toasts.find((t) => t.id === id);
  if (toast) {
    const dedupeId = makeToastId(toast.type, toast.message);
    activeToasts.delete(dedupeId);
  }

  toasts = toasts.map((t) =>
    t.id === id ? { ...t, exiting: true } : t
  );
  emitChange();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  }, 250);
}

export function dismissAll(): void {
  activeToasts.clear();
  toasts = toasts.map((t) => ({ ...t, exiting: true }));
  emitChange();

  setTimeout(() => {
    toasts = [];
    emitChange();
  }, 250);
}

export function updateToast(id: string, updates: Partial<Pick<ToastItem, 'type' | 'message' | 'autoClose' | 'exiting'>>): void {
  toasts = toasts.map((t) => {
    if (t.id !== id) return t;

    const oldDedupeId = makeToastId(t.type, t.message);
    activeToasts.delete(oldDedupeId);

    const updated = { ...t, ...updates };
    const newDedupeId = makeToastId(updated.type, updated.message);
    activeToasts.add(newDedupeId);

    return updated;
  });
  emitChange();
}

export function showPromise<T>(
  promise: Promise<T>,
  messages: { pending: string; success: string; error: string },
  options?: { autoClose?: number | false }
): Promise<T> {
  const loadingId = showLoading(messages.pending);

  return promise
    .then((result) => {
      dismissToast(loadingId);
      setTimeout(() => {
        showSuccess(messages.success, options);
      }, 50);
      return result;
    })
    .catch((err) => {
      dismissToast(loadingId);
      setTimeout(() => {
        showError(messages.error, options);
      }, 50);
      throw err;
    });
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