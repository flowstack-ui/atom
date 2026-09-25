"use client";
import { useCallback, useId, useMemo, useRef } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { usePresence } from "../../hooks/usePresence.js";
export interface UseCollapsibleOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  ids?: Partial<Record<"root" | "trigger" | "content", string>>;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  collapsedHeight?: number | string;
  collapsedWidth?: number | string;
  hideMode?: "display-none" | "activity";
  onExitComplete?: () => void;
}
/** Deterministic validation on both server and client. */
export function collapsedLength(
  value: number | string | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number" && Number.isFinite(value) && value >= 0)
    return `${value}px`;
  if (
    typeof value === "string" &&
    /^(?:0|(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|svh|lvh|dvh|svw|lvw|dvw|%))$/.test(
      value.trim(),
    )
  )
    return value.trim();
  throw new Error(
    "Collapsible collapsed size must be a finite nonnegative number or CSS length (for example 80px or 5rem).",
  );
}
export function useCollapsible(options: UseCollapsibleOptions = {}) {
  const {
    disabled = false,
    orientation = "vertical",
    onExitComplete,
  } = options;
  const [open, updateOpen] = useControllableState({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });
  const generated = useId();
  const rootId = options.ids?.root ?? `${generated}-root`;
  const triggerId = options.ids?.trigger ?? `${generated}-trigger`;
  const contentId = options.ids?.content ?? `${generated}-content`;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const presence = usePresence({ present: open, onExitComplete });
  const registerContent = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      presence.ref(node);
    },
    [presence.ref],
  );
  const measureSize = useCallback(() => {
    const node = contentRef.current;
    if (!node) return;
    node.style.setProperty("--content-height", `${node.scrollHeight}px`);
    node.style.setProperty("--content-width", `${node.scrollWidth}px`);
  }, []);
  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled || next === open) return;
      if (
        !next &&
        contentRef.current?.contains(
          contentRef.current.ownerDocument.activeElement,
        )
      )
        triggerRef.current?.focus({ preventScroll: true });
      updateOpen(next);
    },
    [disabled, open, updateOpen],
  );
  const onToggle = useCallback(() => setOpen(!open), [setOpen, open]);
  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const collapsedHeight = collapsedLength(options.collapsedHeight);
  const collapsedWidth = collapsedLength(options.collapsedWidth);
  return useMemo(
    () => ({
      open,
      isOpen: open,
      visible: open || presence.isPresent,
      disabled,
      orientation,
      setOpen,
      onToggle,
      onOpen,
      onClose,
      measureSize,
      rootId,
      triggerId,
      contentId,
      collapsedHeight,
      collapsedWidth,
      lazyMount: options.lazyMount ?? true,
      unmountOnExit: options.unmountOnExit ?? true,
      lifecycleExplicit:
        options.lazyMount !== undefined || options.unmountOnExit !== undefined,
      hideMode: options.hideMode ?? "display-none",
      contentRef,
      triggerRef,
      registerContent,
    }),
    [
      open,
      presence.isPresent,
      disabled,
      orientation,
      setOpen,
      onToggle,
      onOpen,
      onClose,
      measureSize,
      rootId,
      triggerId,
      contentId,
      collapsedHeight,
      collapsedWidth,
      options.lazyMount,
      options.unmountOnExit,
      options.hideMode,
      registerContent,
    ],
  );
}
export type UseCollapsibleReturn = ReturnType<typeof useCollapsible>;
