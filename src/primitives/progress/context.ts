"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ProgressState } from "./utils.js";
import type { ProgressController } from "./useProgress.js";

export interface ProgressContextValue extends ProgressState {
  /** Available inside Root/RootProvider; optional for legacy raw providers. */
  ids?: ProgressController["ids"];
  setValue?: ProgressController["setValue"];
}

const ProgressContext = createContext<ProgressContextValue | null>(null);
ProgressContext.displayName = "ProgressContext";

export const ProgressContextProvider = ProgressContext.Provider;

export interface ProgressContextProps {
  children: (context: ProgressContextValue) => ReactNode;
}

export function ProgressContextView({ children }: ProgressContextProps): ReactNode {
  return children(useProgressContext());
}

export function useProgressContext(): ProgressContextValue {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("Progress compound components must be used within <ProgressRoot>.");
  }

  return context;
}
