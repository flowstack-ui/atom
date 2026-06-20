"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { hasNativeButtonKeyboardActivation } from "../../utils/native-semantics.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type PressableRootNativeProps = NativeButtonProps<
  | "children"
  | "disabled"
  | "onClick"
  | "onKeyDown"
  | "onKeyUp"
  | "onLostPointerCapture"
  | "onPointerCancel"
  | "onPointerDown"
  | "onPointerUp"
  | "role"
  | "type"
>;

export interface PressableRootProps extends PressableRootNativeProps {
  /** Disable pointer and keyboard activation. */
  disabled?: boolean;
  /** Called when the pressable is activated by pointer or keyboard. */
  onPress?: MouseEventHandler<HTMLElement>;
  /** Consumer click handler. Skipped when disabled. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Consumer keydown handler. Skipped when disabled. */
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  /** Consumer keyup handler. Skipped when disabled. */
  onKeyUp?: KeyboardEventHandler<HTMLElement>;
  /** Consumer pointerdown handler. Skipped when disabled. */
  onPointerDown?: PointerEventHandler<HTMLElement>;
  /** Consumer pointerup handler. Skipped when disabled. */
  onPointerUp?: PointerEventHandler<HTMLElement>;
  /** Consumer pointercancel handler. */
  onPointerCancel?: PointerEventHandler<HTMLElement>;
  /** Consumer lostpointercapture handler. */
  onLostPointerCapture?: PointerEventHandler<HTMLElement>;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the pressable. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

function isPressableActivationKey(key: string): boolean {
  return key === " " || key === "Enter";
}

export const PressableRoot = forwardRef<HTMLElement, PressableRootProps>(
  function PressableRoot(
    {
      disabled = false,
      onPress,
      onClick,
      onKeyDown,
      onKeyUp,
      onLostPointerCapture,
      onPointerCancel,
      onPointerDown,
      onPointerUp,
      render,
      asChild,
      children,
      "data-slot": dataSlot = "pressable",
      ...restProps
    },
    ref,
  ) {
    const [pressed, setPressed] = useState(false);
    const pointerIdRef = useRef<number | null>(null);
    const usesNativeButton =
      !asChild && (render === undefined || render === "button");

    useEffect(() => {
      if (!disabled) return;
      pointerIdRef.current = null;
      setPressed(false);
    }, [disabled]);

    const handleClick = useCallback<MouseEventHandler<HTMLElement>>((event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
      if (!event.defaultPrevented) {
        onPress?.(event);
      }
    }, [disabled, onClick, onPress]);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>((event) => {
      if (disabled) {
        if (isPressableActivationKey(event.key)) {
          event.preventDefault();
        }
        return;
      }

      if (!isPressableActivationKey(event.key)) {
        onKeyDown?.(event);
        return;
      }

      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (hasNativeButtonKeyboardActivation(event.currentTarget, event.key)) {
        return;
      }

      event.preventDefault();
      if (event.key === " ") return;

      event.currentTarget.click();
    }, [disabled, onKeyDown]);

    const handleKeyUp = useCallback<KeyboardEventHandler<HTMLElement>>((event) => {
      if (disabled) {
        if (isPressableActivationKey(event.key)) {
          event.preventDefault();
        }
        return;
      }

      if (!isPressableActivationKey(event.key)) {
        onKeyUp?.(event);
        return;
      }

      onKeyUp?.(event);
      if (event.defaultPrevented) return;

      if (hasNativeButtonKeyboardActivation(event.currentTarget, event.key)) {
        return;
      }

      if (event.key !== " ") return;

      event.preventDefault();
      event.currentTarget.click();
    }, [disabled, onKeyUp]);

    const handlePointerDown = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onPointerDown?.(event);
      if (event.defaultPrevented || event.button !== 0) return;

      pointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setPressed(true);
    }, [disabled, onPointerDown]);

    const handlePointerUp = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      if (disabled) return;

      onPointerUp?.(event);
      if (pointerIdRef.current !== event.pointerId) return;

      event.currentTarget.releasePointerCapture?.(event.pointerId);
      pointerIdRef.current = null;
      setPressed(false);
    }, [disabled, onPointerUp]);

    const handlePointerCancel = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerCancel?.(event);
      if (pointerIdRef.current !== event.pointerId) return;

      event.currentTarget.releasePointerCapture?.(event.pointerId);
      pointerIdRef.current = null;
      setPressed(false);
    }, [onPointerCancel]);

    const handleLostPointerCapture = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onLostPointerCapture?.(event);
      if (pointerIdRef.current !== event.pointerId) return;

      pointerIdRef.current = null;
      setPressed(false);
    }, [onLostPointerCapture]);

    // Native props pass through first; Atom-owned press semantics stay authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(usesNativeButton
        ? { type: "button", disabled: disabled || undefined }
        : {
            role: "button",
            tabIndex: 0,
            "aria-disabled": disabled || undefined,
          }),
      ...(disabled && { "data-disabled": "" }),
      ...(pressed && { "data-pressed": "" }),
      "data-slot": dataSlot,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onLostPointerCapture: handleLostPointerCapture,
      onPointerCancel: handlePointerCancel,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", {
      ...behaviorProps,
      children,
    });
  },
);
