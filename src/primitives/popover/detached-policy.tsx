"use client";

import { createContext, useContext } from "react";

/** Internal policy shared with the detached ActionBar owner, never a Popover prop. */
export interface DetachedLayerPolicy {
  lazyMount: boolean;
  unmountOnExit: boolean;
  onExitComplete?: () => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  persistentElements?: Array<() => HTMLElement | null>;
}
export const DetachedLayerPolicyContext = createContext<DetachedLayerPolicy | null>(null);
DetachedLayerPolicyContext.displayName = "DetachedLayerPolicy";
export const useDetachedLayerPolicy = () => useContext(DetachedLayerPolicyContext);
