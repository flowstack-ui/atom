"use client";

import { createContext, useContext, type ReactNode } from "react";
import { OverlayScopeProvider } from "../../hooks/overlayScope.js";
import { useFloatingPanel, type FloatingPanelController, type FloatingPanelOptions, type InternalPanel } from "./controller.js";

const PanelContext = createContext<InternalPanel | null>(null);
PanelContext.displayName = "FloatingPanelContext";
export interface FloatingPanelRootProps extends FloatingPanelOptions { children?: ReactNode }
export function FloatingPanelRoot({ children, ...options }: FloatingPanelRootProps) {
  const value = useFloatingPanel(options);
  return <FloatingPanelRootProvider value={value}>{children}</FloatingPanelRootProvider>;
}
export interface FloatingPanelRootProviderProps { value: FloatingPanelController; children?: ReactNode }
export function FloatingPanelRootProvider({ value, children }: FloatingPanelRootProviderProps) {
  if (!("content" in value && "options" in value)) throw new Error("FloatingPanel.RootProvider requires a controller returned by useFloatingPanel.");
  return <OverlayScopeProvider value={(value as InternalPanel).overlayScope}><PanelContext.Provider value={value as InternalPanel}>{children}</PanelContext.Provider></OverlayScopeProvider>;
}
export function useFloatingPanelContext(): FloatingPanelController { return usePanelContext(); }
export function usePanelContext(): InternalPanel {
  const context = useContext(PanelContext);
  if (!context) throw new Error("FloatingPanel parts require Root or RootProvider.");
  return context;
}
export interface FloatingPanelContextProps { children: (value: FloatingPanelController) => ReactNode }
export function FloatingPanelContext({ children }: FloatingPanelContextProps) { return children(useFloatingPanelContext()); }
