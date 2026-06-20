import type { ToastData, ToastId, ToastOptions, ToastType } from "./types.js";

let toasts: ToastData[] = [];
const listeners = new Set<() => void>();
let counter = 0;

function generateId(): ToastId {
  counter += 1;
  return `toast-${counter}-${Date.now()}`;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function getDefaultToastDuration(type: ToastType): number {
  if (type === "loading") return Infinity;
  if (type === "error") return 8000;
  return 5000;
}

export function getToastRole(type: ToastType): "status" | "alert" {
  return type === "error" || type === "warning" ? "alert" : "status";
}

export function getToastAriaLive(type: ToastType): "polite" | "assertive" {
  return type === "error" || type === "warning" ? "assertive" : "polite";
}

export function getToasts(): ToastData[] {
  return toasts;
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function addToast(options: ToastOptions & { type: ToastType }): ToastId {
  const id = options.id ?? generateId();
  const duration = options.duration ?? getDefaultToastDuration(options.type);

  const data: ToastData = {
    id,
    type: options.type,
    title: options.title,
    description: options.description,
    duration,
    icon: options.icon,
    action: options.action,
    cancel: options.cancel,
    closeButton: options.closeButton ?? false,
    dismissible: options.dismissible ?? true,
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose,
    className: options.className,
    createdAt: Date.now(),
    paused: false,
    remainingDuration: duration,
  };

  toasts = [data, ...toasts.filter((toast) => toast.id !== id)];
  notify();
  return id;
}

export function dismissToast(id?: ToastId): void {
  if (id) {
    const toast = toasts.find((item) => item.id === id);
    toast?.onDismiss?.(id);
    toasts = toasts.filter((item) => item.id !== id);
  } else {
    toasts.forEach((toast) => toast.onDismiss?.(toast.id));
    toasts = [];
  }

  notify();
}

export function updateToast(id: ToastId, updates: Partial<ToastOptions>): void {
  toasts = toasts.map((toast) => {
    if (toast.id !== id) return toast;

    const nextType = updates.type ?? toast.type;
    const nextDuration =
      updates.duration ?? (updates.type ? getDefaultToastDuration(nextType) : undefined);

    return {
      ...toast,
      ...updates,
      type: nextType,
      ...(nextDuration !== undefined
        ? {
            duration: nextDuration,
            remainingDuration: nextDuration,
            paused: false,
            createdAt: Date.now(),
          }
        : {}),
    };
  });

  notify();
}

export function pauseToast(id: ToastId): void {
  toasts = toasts.map((toast) => {
    if (toast.id !== id || toast.paused || toast.duration === Infinity) return toast;
    const elapsed = Date.now() - toast.createdAt;
    const remainingDuration = Math.max(0, toast.remainingDuration - elapsed);
    return { ...toast, paused: true, remainingDuration };
  });

  notify();
}

export function resumeToast(id: ToastId): void {
  toasts = toasts.map((toast) => {
    if (toast.id !== id || !toast.paused) return toast;
    return { ...toast, paused: false, createdAt: Date.now() };
  });

  notify();
}
