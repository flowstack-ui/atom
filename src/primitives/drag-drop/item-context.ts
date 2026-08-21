"use client";

import { createContext, useContext } from "react";

export interface DragDropItemContextValue {
  value: string;
  label: string;
  disabled: boolean;
}

const DragDropItemContext = createContext<DragDropItemContextValue | null>(null);
DragDropItemContext.displayName = "DragDropItemContext";

export const DragDropItemContextProvider = DragDropItemContext.Provider;

export function useDragDropItemContext(): DragDropItemContextValue {
  const context = useContext(DragDropItemContext);
  if (!context) {
    throw new Error("DragDrop.Handle must be used within <DragDrop.Draggable>");
  }
  return context;
}
