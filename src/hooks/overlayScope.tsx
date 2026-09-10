"use client";

import { createContext, useContext, useMemo, useCallback, useRef } from "react";

/** React ancestry survives portals; DOM containment alone cannot order layers. */
export interface OverlayScope { parent: OverlayScope | null; modal: boolean; activation: number; hosts: Set<HTMLElement>; refresh?: () => void }
const Context = createContext<OverlayScope | null>(null);
Context.displayName = "OverlayScope";
export const OverlayScopeProvider = Context.Provider;
export function useCurrentOverlayScope() { return useContext(Context); }
export function useCreateOverlayScope(modal = false): OverlayScope {
  const parent = useCurrentOverlayScope();
  const scope = useMemo(() => ({ parent, modal, activation: 0, hosts: new Set<HTMLElement>() }), [parent]);
  scope.modal = modal;
  return scope;
}

/** Registers an additional owned stacking host without exposing a second layer. */
export function useOverlayLayerHost() {
  const scope = useCurrentOverlayScope();
  const previous = useRef<HTMLElement | null>(null);
  return useCallback((node: HTMLElement | null) => {
    if (previous.current) {
      scope?.hosts.delete(previous.current);
      previous.current.style.removeProperty("--atom-overlay-layer");
    }
    previous.current = node;
    if (node) scope?.hosts.add(node);
    scope?.refresh?.();
  }, [scope]);
}
