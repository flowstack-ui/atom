"use client";
import { createContext, useContext } from "react";
import type { PanelBounds, SplitterPanelConfig, SplitterSizes } from "./state.js";
import type { SplitterRegistry } from "./registry.js";
export type SplitterOrientation = "horizontal" | "vertical";
export interface SplitterResizeDetails {
  layout: string;
  boundary: { before: string; after: string } | null;
  sizes: Record<string, number>;
  pixels: Record<string, number> | null;
  source: "pointer" | "keyboard" | "programmatic";
  cancelled: boolean;
}
export interface SplitterContextValue {
  isDragging: boolean;
  orientation: SplitterOrientation;
  sizes: Record<string, number>;
  setSizes: (sizes: SplitterSizes) => void;
  resetSizes: () => void;
  collapsePanel: (id: string) => void;
  expandPanel: (id: string) => void;
  isPanelCollapsed: (id: string) => boolean;
  getPanels: () => readonly SplitterPanelConfig[];
  getPanelSize: (id: string) => number;
  getLayout: () => string;
  getItems: () => ReadonlyArray<{ type: "panel"; id: string } | { type: "handle"; before: string; after: string }>;
  resizePanel: (id: string, size: number) => void;
  isPanelExpanded: (id: string) => boolean;
}
export interface SplitterInternalContext extends SplitterContextValue {
  registry?: SplitterRegistry;
  panels: readonly SplitterPanelConfig[]; bounds: PanelBounds[]; extent: number;
  orientation: SplitterOrientation; dir: "ltr" | "rtl"; disabled: boolean;
  keyboardStep: number; prefix: string; dragging: string | null;
  setDragging: (id: string | null) => void;
  change: (sizes: Record<string, number>, source: SplitterResizeDetails["source"], cancelled?: boolean) => void;
  notify: (phase: "start" | "end", sizes: Record<string, number>, source: SplitterResizeDetails["source"], cancelled?: boolean) => void;
}
export const SplitterProvider = createContext<SplitterInternalContext | null>(null);
SplitterProvider.displayName = "SplitterProvider";
export function useSplitterInternal() {
  const value = useContext(SplitterProvider);
  if (!value) throw new Error("Splitter parts require Splitter.Root.");
  return value;
}
export function useSplitterContext(): SplitterContextValue {
  const { sizes, setSizes, resetSizes, collapsePanel, expandPanel, isPanelCollapsed, getPanels, getPanelSize, getLayout, getItems, resizePanel, isPanelExpanded, isDragging, orientation } = useSplitterInternal();
  return { sizes, setSizes, resetSizes, collapsePanel, expandPanel, isPanelCollapsed, getPanels, getPanelSize, getLayout, getItems, resizePanel, isPanelExpanded, isDragging, orientation };
}
