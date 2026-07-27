import type { ReactNode } from "react";

export type ToastId = string;

export type ToastType =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

export type ToastPosition =
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastSwipeDirection = "left" | "right" | "up" | "down";
export type ToastSwipeState = "start" | "move" | "cancel" | "end";

export type ToastState = "entering" | "visible" | "exiting";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: ToastId;
  title?: ReactNode;
  description?: ReactNode;
  type?: ToastType;
  duration?: number;
  icon?: ReactNode;
  action?: ToastAction;
  cancel?: ToastAction;
  closeButton?: boolean;
  dismissible?: boolean;
  onDismiss?: (id: ToastId) => void;
  onAutoClose?: (id: ToastId) => void;
  className?: string;
}

export interface ToastData {
  id: ToastId;
  type: ToastType;
  duration: number;
  dismissible: boolean;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ToastAction;
  cancel?: ToastAction;
  closeButton?: boolean;
  onDismiss?: (id: ToastId) => void;
  onAutoClose?: (id: ToastId) => void;
  className?: string;
  createdAt: number;
  paused: boolean;
  remainingDuration: number;
}

export interface ToastPromiseOptions<T> {
  loading: string | Omit<ToastOptions, "type" | "duration">;
  success: string | ((data: T) => string | Omit<ToastOptions, "type">);
  error: string | ((error: unknown) => string | Omit<ToastOptions, "type">);
}

export interface ToastViewportRenderState {
  toast: ToastData;
  index: number;
  expanded: boolean;
}

export type ToastUpdateOptions = Omit<Partial<ToastOptions>, "id">;
