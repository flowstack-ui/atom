"use client";
import { createContext, useContext } from "react";
import type { PanelBounds, SplitterPanelConfig, SplitterSizes } from "./state.js";
export type SplitterOrientation = "horizontal" | "vertical";
export interface SplitterResizeDetails {
  sizes: Record<string, number>;
  pixels: Record<string, number> | null;
  source: "pointer" | "keyboard" | "programmatic";
  cancelled: boolean;
}
export interface SplitterContextValue {
  sizes: Record<string, number>;
  setSizes: (sizes: SplitterSizes) => void;
  resetSizes: () => void;
  collapsePanel: (id: string) => void;
  expandPanel: (id: string) => void;
  isPanelCollapsed: (id: string) => boolean;
}
export interface SplitterInternalContext extends SplitterContextValue {
  panels: readonly SplitterPanelConfig[]; bounds: PanelBounds[]; extent: number;
  orientation: SplitterOrientation; dir: "ltr" | "rtl"; disabled: boolean;
  keyboardStep: number; prefix: string; dragging: string | null;
  setDragging: (id: string | null) => void;
  change: (sizes: Record<string, number>, source: SplitterResizeDetails["source"], cancelled?: boolean) => void;
  notify: (phase: "start" | "end", sizes: Record<string, number>, source: SplitterResizeDetails["source"], cancelled?: boolean) => void;
}
export const SplitterProvider = createContext<SplitterInternalContext | null>(null);
SplitterProvider.displayName = "SplitterProvider";
export function useSplitter() {
  const value = useContext(SplitterProvider);
  if (!value) throw new Error("Splitter parts require Splitter.Root.");
  return value;
}
