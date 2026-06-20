"use client";

import { useSyncExternalStore } from "react";
import { getToasts, subscribeToasts } from "./store.js";
import type { ToastData } from "./types.js";

export function useToastStore(): ToastData[] {
  return useSyncExternalStore(subscribeToasts, getToasts, getToasts);
}
