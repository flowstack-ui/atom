"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  ClipboardContextProvider,
  type ClipboardContextValue,
  type ClipboardStatusValue,
  type ClipboardStatusDetails,
} from "./context.js";

type ClipboardRootNativeProps = NativeDivProps<"children">;

export type ClipboardWriteValue = (value: string) => void | Promise<void>;

export interface ClipboardRootProps extends ClipboardRootNativeProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  timeout?: number;
  onStatusChange?: (details: ClipboardStatusDetails) => void;
  writeValue?: ClipboardWriteValue;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

async function writeClipboardText(value: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("The Clipboard API is unavailable in this environment");
  }
  await navigator.clipboard.writeText(value);
}

export const ClipboardRoot = forwardRef<HTMLDivElement, ClipboardRootProps>(
  function ClipboardRoot(
    {
      children,
      value,
      defaultValue = "",
      onValueChange,
      disabled = false,
      timeout = 3000,
      onStatusChange,
      writeValue = writeClipboardText,
      render,
      asChild,
      id: providedId,
      "data-slot": dataSlot = "clipboard",
      ...restProps
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = providedId ?? autoId;
    const inputId = `${baseId}-input`;
    const labelId = `${baseId}-label`;
    const [resolvedValue, setResolvedValue] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const [status, setStatus] = useState<ClipboardStatusValue>("idle");
    const operationRef = useRef(0);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearResetTimer = useCallback(() => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    }, []);

    useEffect(() => () => {
      operationRef.current += 1;
      clearResetTimer();
    }, [clearResetTimer]);

    const transition = useCallback(
      (nextStatus: ClipboardStatusValue, error?: unknown) => {
        setStatus(nextStatus);
        onStatusChange?.({ status: nextStatus, ...(error !== undefined && { error }) });
      },
      [onStatusChange],
    );

    const copy = useCallback(async () => {
      if (disabled) return;
      clearResetTimer();
      const operation = ++operationRef.current;
      const copiedValue = resolvedValue;
      transition("copying");
      try {
        await writeValue(copiedValue);
        if (operation !== operationRef.current) return;
        transition("copied");
      } catch (error) {
        if (operation !== operationRef.current) return;
        transition("error", error);
      }

      if (operation !== operationRef.current) return;
      resetTimerRef.current = setTimeout(() => {
        if (operation === operationRef.current) transition("idle");
        resetTimerRef.current = null;
      }, Math.max(0, timeout));
    }, [clearResetTimer, disabled, resolvedValue, timeout, transition, writeValue]);

    const contextValue = useMemo<ClipboardContextValue>(
      () => ({
        value: resolvedValue,
        setValue: setResolvedValue,
        status,
        disabled,
        inputId,
        labelId,
        copy,
      }),
      [copy, disabled, inputId, labelId, resolvedValue, setResolvedValue, status],
    );
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: baseId,
      "data-slot": dataSlot,
      "data-state": status,
      ...(disabled && { "data-disabled": "" }),
    };
    const root = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return <ClipboardContextProvider value={contextValue}>{root}</ClipboardContextProvider>;
  },
);
