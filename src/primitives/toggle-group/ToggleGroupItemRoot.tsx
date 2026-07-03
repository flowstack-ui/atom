"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  childHasNativeButtonSemantics,
  childIsNativeButton,
  renderHasNativeButtonSemantics,
  renderIsNativeButton,
} from "../../utils/native-semantics.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { isToggleActivationKey } from "../toggle/ToggleRoot.js";
import { useToggleGroupContext } from "./context.js";

type ToggleGroupItemRootNativeProps = NativeButtonProps<
  "children" | "disabled" | "onChange" | "role" | "type" | "value"
>;

type ToggleGroupFocusableElement = Pick<HTMLElement, "dataset">;

export function getToggleGroupTabStopValue(
  registeredValues: string[],
  selectedValues: string[],
  getItemElement: (value: string) => ToggleGroupFocusableElement | null,
  isItemDisabled: (value: string) => boolean = () => false,
): string | undefined {
  const firstPressedValue = registeredValues.find((registeredValue) =>
    selectedValues.includes(registeredValue),
  );

  return firstPressedValue ?? registeredValues.find((registeredValue) => {
    const element = getItemElement(registeredValue);
    return element && !isItemDisabled(registeredValue);
  });
}

export interface ToggleGroupItemRootProps extends ToggleGroupItemRootNativeProps {
  /** Unique value identifier. */
  value: string;
  /** Disable this item. */
  disabled?: boolean;
  /** Accessible label. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the item. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ToggleGroupItemRoot = forwardRef<HTMLButtonElement, ToggleGroupItemRootProps>(
  function ToggleGroupItemRoot(
    {
      value,
      disabled = false,
      ariaLabel,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "toggle-group-item",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const context = useToggleGroupContext();

    const internalRef = useRef<HTMLElement | null>(null);
    const [itemElement, setItemElement] = useState<HTMLElement | null>(null);
    const composedRef = useMemo(
      () => composeRefs(
        (node: unknown) => {
          const element = node as HTMLElement | null;
          internalRef.current = element;
          setItemElement((current) => (current === element ? current : element));
        },
        ref,
      ),
      [ref],
    );
    const isPressed = context.value.includes(value);
    const isDisabled = disabled || context.disabled;
    const isDefaultButton = !asChild && render === undefined;
    const hasNativeSemantics = isDefaultButton ||
      (asChild
        ? childHasNativeButtonSemantics(children)
        : renderHasNativeButtonSemantics(render));
    const isNativeButton = isDefaultButton ||
      (asChild ? childIsNativeButton(children) : renderIsNativeButton(render));

    useEffect(() => {
      if (!itemElement) return undefined;

      context.registerItem(value, itemElement, isDisabled);
      return () => {
        context.unregisterItem(value);
      };
    }, [context.registerItem, context.unregisterItem, isDisabled, itemElement, value]);

    const firstFocusableValue = getToggleGroupTabStopValue(
      context.registeredValues,
      context.value,
      context.getItemElement,
      context.isItemDisabled,
    );
    const tabIndex = value === firstFocusableValue ? 0 : -1;

    const press: MouseEventHandler<HTMLButtonElement> = () => {
      if (!isDisabled) {
        context.onItemPress(value);
      }
    };

    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (!isToggleActivationKey(event.key)) return;

      event.preventDefault();
      if (!isDisabled) {
        context.onItemPress(value);
      }
    };

    // Native button props pass through first; group state and roving focus stay authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      ...(isNativeButton ? { type: "button", disabled: isDisabled || undefined } : {}),
      ...(!hasNativeSemantics ? { role: "button" } : {}),
      "aria-pressed": isPressed,
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      ...(!isNativeButton && { "aria-disabled": isDisabled || undefined }),
      tabIndex,
      "data-state": isPressed ? "on" : "off",
      "data-slot": dataSlot,
      "data-value": value,
      ...(isDisabled && { "data-disabled": "" }),
      className,
      onClick: composeEventHandlers(onClick, press),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", { ...behaviorProps, children });
  },
);
