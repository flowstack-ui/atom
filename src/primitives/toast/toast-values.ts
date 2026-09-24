import type { ToastType } from "./types.js";
export function getDefaultToastDuration(type: ToastType): number {
  if (type === "loading") return Infinity;
  if (type === "error") return 8000;
  return 5000;
}

export function normalizeToastDuration(duration: number | undefined, type: ToastType): number {
  if (duration === Infinity) return Infinity;
  return typeof duration === "number" && Number.isFinite(duration) && duration > 0
    ? duration
    : getDefaultToastDuration(type);
}

export function normalizeMaxVisible(maxVisible: number): number {
  return Number.isFinite(maxVisible) && maxVisible > 0
    ? Math.max(1, Math.floor(maxVisible))
    : 3;
}

export function getToastRole(type: ToastType): "status" | "alert" {
  return type === "error" || type === "warning" ? "alert" : "status";
}

export function getToastAriaLive(type: ToastType): "polite" | "assertive" {
  return type === "error" || type === "warning" ? "assertive" : "polite";
}
