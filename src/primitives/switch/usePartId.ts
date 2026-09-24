"use client";

import { useEffect, useLayoutEffect } from "react";
import { useSwitchInternalContext, type SwitchPartKind } from "./context.js";

const useClientLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

/** Local native IDs are shared before paint; owner ids provide SSR associations. */
export function useSwitchPartId(kind: SwitchPartKind, id: string | undefined) {
  const { registerPartId } = useSwitchInternalContext();
  useClientLayoutEffect(() => {
    if (id !== undefined) return registerPartId?.(kind, id);
  }, [id, kind, registerPartId]);
}
