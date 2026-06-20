"use client";

import { useCallback, useMemo, useRef, type ReactNode } from "react";
import {
  TooltipProviderContextProvider,
  type TooltipProviderContextValue,
} from "./context.js";

export interface TooltipProviderProps {
  children: ReactNode;
  openDelay?: number;
  closeDelay?: number;
  skipDelay?: number;
}

export function TooltipProvider({
  children,
  openDelay = 400,
  closeDelay = 150,
  skipDelay = 300,
}: TooltipProviderProps) {
  const lastCloseTimestampRef = useRef(0);

  const onTooltipClose = useCallback(() => {
    lastCloseTimestampRef.current = Date.now();
  }, []);

  const isSkipDelayActive = useCallback(
    () => Date.now() - lastCloseTimestampRef.current < skipDelay,
    [skipDelay],
  );

  const contextValue: TooltipProviderContextValue = useMemo(
    () => ({
      openDelay,
      closeDelay,
      skipDelay,
      onTooltipClose,
      isSkipDelayActive,
    }),
    [closeDelay, isSkipDelayActive, onTooltipClose, openDelay, skipDelay],
  );

  return (
    <TooltipProviderContextProvider value={contextValue}>
      {children}
    </TooltipProviderContextProvider>
  );
}
