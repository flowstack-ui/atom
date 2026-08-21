"use client";

import { createContext, useContext } from "react";
import type { DirectionValue } from "../direction/index.js";

export type DragDropInput = "keyboard" | "pointer";
export type DragDropOrientation = "horizontal" | "vertical";
export type DragDropPosition = "after" | "before" | "on";

export interface DragDropDetails {
  activeValue: string;
  input: DragDropInput;
  overValue: string;
  position: DragDropPosition;
}

export interface DragDropState {
  activeValue: string | null;
  deltaX: number;
  deltaY: number;
  input: DragDropInput | null;
  overValue: string | null;
  position: DragDropPosition | null;
}

export interface DragDropMessages {
  grabbed?: (label: string) => string;
  moved?: (label: string, position: number, total: number) => string;
  movedOn?: (label: string, targetLabel: string) => string;
  dropped?: (label: string, position: number, total: number) => string;
  droppedOn?: (label: string, targetLabel: string) => string;
  cancelled?: (label: string) => string;
}

export interface DragDropSourceRegistration {
  disabled: boolean;
  element: HTMLElement;
  label: string;
  value: string;
}

export interface DragDropTargetRegistration {
  disabled: boolean;
  element: HTMLElement;
  label: string;
  mode: "before-after" | "on";
  value: string;
}

export interface DragDropContextValue {
  state: DragDropState;
  disabled: boolean;
  dir: DirectionValue;
  readOnly: boolean;
  orientation: DragDropOrientation;
  instructionsId: string;
  registerSource: (registration: DragDropSourceRegistration) => () => void;
  registerTarget: (registration: DragDropTargetRegistration) => () => void;
  begin: (value: string, input: DragDropInput, point?: { x: number; y: number }) => boolean;
  updatePointer: (point: { x: number; y: number }) => void;
  moveKeyboard: (direction: "end" | "first" | "last" | "start") => void;
  commit: () => void;
  cancel: () => void;
}

const DragDropContext = createContext<DragDropContextValue | null>(null);
DragDropContext.displayName = "DragDropContext";

export const DragDropContextProvider = DragDropContext.Provider;

export function useDragDropContext(): DragDropContextValue {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error("DragDrop compound components must be used within <DragDrop.Root>");
  }
  return context;
}
