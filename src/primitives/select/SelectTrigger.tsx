"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useSelectContext } from "./context.js";
import {
  getInitialSelectHighlight,
  getNextSelectHighlight,
  getSelectTypeaheadMatch,
} from "./keyboard.js";

type SelectTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "role" | "type">;

export interface SelectTriggerProps extends SelectTriggerNativeProps {
  children?: ReactNode;
  className?: string;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(
    {
      children,
      className,
      asChild = false,
      render,
      "data-slot": dataSlot = "select-trigger",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const {
      "aria-label": nativeAriaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...buttonProps
    } = restProps;
    const ctx = useSelectContext();
    const {
      disabled,
      invalid,
      readOnly,
      fieldControlId,
      fieldDescribedBy,
      fieldLabelId,
      getEnabledItemValues,
      getItemId,
      highlightedValue,
      isOpen,
      listboxId,
      onClose,
      onHighlight,
      onOpen,
      onToggle,
      onValueChange,
      required,
      triggerId,
      triggerRef,
    } = ctx;
    const ctxRef = useRef(ctx);
    ctxRef.current = ctx;
    const typeaheadBuffer = useRef("");
    const typeaheadTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const composedRef = useMemo(() => composeRefs(triggerRef, ref), [triggerRef, ref]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
      if (!disabled && !readOnly) onToggle();
    }, [disabled, onToggle, readOnly]);

    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = useCallback(
      (event) => {
        if (disabled || readOnly) return;

        const values = getEnabledItemValues();
        const currentValue = highlightedValue ?? getInitialSelectHighlight(ctxRef.current);

        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            if (!isOpen) {
              onOpen("current");
              onHighlight(getInitialSelectHighlight(ctxRef.current));
            } else {
              onHighlight(getNextSelectHighlight(values, currentValue, "next"));
            }
            break;
          }
          case "ArrowUp": {
            event.preventDefault();
            if (!isOpen) {
              onOpen("last");
              onHighlight(values[values.length - 1] ?? null);
            } else {
              onHighlight(getNextSelectHighlight(values, currentValue, "previous"));
            }
            break;
          }
          case "Enter":
          case " ": {
            event.preventDefault();
            if (!isOpen) {
              onOpen("current");
              onHighlight(getInitialSelectHighlight(ctxRef.current));
            } else if (highlightedValue) {
              onValueChange(highlightedValue);
            }
            break;
          }
          case "Home": {
            event.preventDefault();
            if (!isOpen) onOpen("first");
            onHighlight(values[0] ?? null);
            break;
          }
          case "End": {
            event.preventDefault();
            if (!isOpen) onOpen("last");
            onHighlight(values[values.length - 1] ?? null);
            break;
          }
          case "Escape": {
            if (isOpen) {
              event.preventDefault();
              onClose();
            }
            break;
          }
          case "Tab": {
            if (isOpen) onClose();
            break;
          }
          default: {
            if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;

            event.preventDefault();
            typeaheadBuffer.current += event.key.toLowerCase();
            clearTimeout(typeaheadTimeout.current);
            typeaheadTimeout.current = setTimeout(() => {
              typeaheadBuffer.current = "";
            }, 500);

            if (!isOpen) onOpen("current");

            const match = getSelectTypeaheadMatch(
              ctxRef.current,
              typeaheadBuffer.current,
              highlightedValue,
            );
            if (match) onHighlight(match);
          }
        }
      },
      [
        disabled,
        getEnabledItemValues,
        highlightedValue,
        isOpen,
        onClose,
        onHighlight,
        onOpen,
        onValueChange,
        readOnly,
      ],
    );

    const activeDescendant = highlightedValue
      ? getItemId(highlightedValue)
      : undefined;

    const triggerProps = {
      ...buttonProps,
      ref: composedRef,
      id: buttonProps.id ?? fieldControlId ?? triggerId,
      type: !asChild && !render ? "button" : undefined,
      role: "combobox",
      tabIndex: asChild || render ? (disabled ? -1 : 0) : undefined,
      "aria-expanded": isOpen,
      "aria-haspopup": "listbox",
      "aria-controls": listboxId,
      "aria-activedescendant": isOpen ? activeDescendant : undefined,
      "aria-label": nativeAriaLabel,
      "aria-labelledby": ariaLabelledBy ?? (nativeAriaLabel ? undefined : fieldLabelId),
      "aria-describedby": ariaDescribedBy ?? fieldDescribedBy,
      "aria-required": required || undefined,
      "aria-disabled": disabled || undefined,
      "aria-readonly": readOnly || undefined,
      "aria-invalid": invalid || undefined,
      disabled: !asChild && !render ? disabled : undefined,
      "data-slot": dataSlot,
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
      "data-readonly": readOnly ? "" : undefined,
      "data-invalid": invalid ? "" : undefined,
      className,
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    if (asChild) {
      return cloneAndMerge(children, triggerProps);
    }

    return renderElement(render, "button", { ...triggerProps, children });
  },
);
