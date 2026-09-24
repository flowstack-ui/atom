"use client";

import { useSyncExternalStore } from "react";
import { defaultToastStore, type ToastStore } from "./store.js";
import type { ToastData } from "./types.js";

export function useToastStore(store: ToastStore = defaultToastStore): ToastData[] {
  return useSyncExternalStore(store.subscribe, store.getToasts, store.getToasts);
}
