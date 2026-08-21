"use client";

import { createContext, useContext } from "react";
import type { DragDropInput, DragDropPosition } from "../drag-drop/index.js";

export type ReorderMove = "after" | "before" | "end" | "start";

export interface ReorderChangeDetails {
  activeValue: string;
  input: DragDropInput | "control";
  overValue: string;
  position: DragDropPosition;
  previousIndex: number;
  nextIndex: number;
}

export interface ReorderContextValue {
  items: string[];
  disabled: boolean;
  readOnly: boolean;
  getItemLabel: (value: string) => string;
  move: (value: string, move: ReorderMove) => void;
}

const ReorderContext = createContext<ReorderContextValue | null>(null);
ReorderContext.displayName = "ReorderContext";

export const ReorderContextProvider = ReorderContext.Provider;

export function useReorderContext(): ReorderContextValue {
  const context = useContext(ReorderContext);
  if (!context) throw new Error("Reorder compound components must be used within <Reorder.Root>");
  return context;
}

export interface ReorderItemContextValue {
  value: string;
  disabled: boolean;
}

const ReorderItemContext = createContext<ReorderItemContextValue | null>(null);
ReorderItemContext.displayName = "ReorderItemContext";

export const ReorderItemContextProvider = ReorderItemContext.Provider;

export function useReorderItemContext(): ReorderItemContextValue {
  const context = useContext(ReorderItemContext);
  if (!context) throw new Error("Reorder item parts must be used within <Reorder.Item>");
  return context;
}
