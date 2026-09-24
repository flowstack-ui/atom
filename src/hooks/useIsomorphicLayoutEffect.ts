"use client";

import { useEffect, useLayoutEffect, type EffectCallback, type DependencyList } from "react";

/** Preserve pre-paint browser effects without emitting server-render warnings. */
export function useIsomorphicLayoutEffect(effect: EffectCallback, dependencies?: DependencyList): void {
  // SSR and hydration may share a module in consumers and tests.
  const useEffectForEnvironment = typeof document === "undefined" ? useEffect : useLayoutEffect;
  useEffectForEnvironment(effect, dependencies);
}
