"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type ChangeEventHandler,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import type { NativeInputProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useComboboxContext } from "./context.js";
import { getNextComboboxValue } from "./utils.js";

type ComboboxInputNativeProps = NativeInputProps<
  | "children"
  | "disabled"
  | "readOnly"
  | "required"
  | "role"
  | "type"
  | "value"
>;

export interface ComboboxInputProps extends ComboboxInputNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  function ComboboxInput(
    {
      children,
      asChild = false,
      render,
      "data-slot": dataSlot = "combobox-input",
      onChange,
      onFocus,
      onKeyDown,
      onClick,
      autoComplete = "off",
      ...restProps
    },
    ref,
  ) {
    const ctx = useComboboxContext();
    const composedRef = useMemo(() => composeRefs(ctx.inputRef, ref), [ctx.inputRef, ref]);
    const {
      clearSelection,
      clearOnSelect,
      disabled,
      filteredOptions,
      fieldDescribedBy,
      fieldLabelId,
      form,
      freeSolo,
      getEnabledItemValues,
      getItemId,
      getOption,
      highlightedValue,
      emptyMounted,
      inputValue,
      invalid,
      isOpen,
      listboxId,
      loading,
      onClose,
      onHighlight,
      onInputValueChange,
      onOpen,
      onValueChange,
      openOnFocus,
      readOnly,
      required,
      selectOption,
      consumeInputFocusOpenSuppression,
      value,
    } = ctx;

    const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
      (event) => {
        onInputValueChange(event.target.value);
        const shouldOpen = typeof ctx.openOnChange === "function" ? ctx.openOnChange({ inputValue: event.target.value }) : ctx.openOnChange;
        if (shouldOpen) onOpen();
        else onClose();
      },
      [onInputValueChange, onOpen, onClose, ctx.openOnChange],
    );

    const handleFocus: FocusEventHandler<HTMLInputElement> = useCallback(() => {
      if (consumeInputFocusOpenSuppression()) return;
      if (
        openOnFocus &&
        !disabled &&
        !readOnly &&
        (filteredOptions.length > 0 || loading || emptyMounted)
      ) {
        onOpen();
      }
    }, [
      consumeInputFocusOpenSuppression,
      disabled,
      emptyMounted,
      filteredOptions.length,
      loading,
      onOpen,
      openOnFocus,
      readOnly,
    ]);

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
      (event) => {
        if (disabled || readOnly || event.nativeEvent.isComposing || event.keyCode === 229) return;

        const values = getEnabledItemValues();
        const currentValue = highlightedValue;
        const highlight = (next: string | null) => {
          onHighlight(next);
          if (next !== null && ctx.inputBehavior === "autocomplete") ctx.completeOption(next);
        };

        switch (event.key) {
          case "ArrowDown": {
            if (!isOpen && !ctx.openOnKeyPress) return;
            event.preventDefault();
            if (!isOpen) onOpen();
            highlight(getNextComboboxValue(values, currentValue, "next", ctx.loopFocus));
            break;
          }
          case "ArrowUp": {
            if (!isOpen && !ctx.openOnKeyPress) return;
            event.preventDefault();
            if (!isOpen) onOpen();
            highlight(getNextComboboxValue(values, currentValue, "previous", ctx.loopFocus));
            break;
          }
          case "Home": {
            if (!isOpen) return;
            if (event.altKey || event.metaKey || event.ctrlKey) return;
            event.preventDefault();
            if (!isOpen) onOpen();
            highlight(values[0] ?? null);
            break;
          }
          case "End": {
            if (!isOpen) return;
            if (event.altKey || event.metaKey || event.ctrlKey) return;
            event.preventDefault();
            if (!isOpen) onOpen();
            highlight(values[values.length - 1] ?? null);
            break;
          }
          case "Enter": {
            if (!isOpen) return;
            event.preventDefault();
            if (highlightedValue !== null) {
              const option = getOption(highlightedValue);
              const element = ctx.getItemElement(highlightedValue);
              if (element?.tagName === "A") element.click();
              else if (option) selectOption(option);
            } else if (freeSolo && inputValue) {
              selectOption({ value: inputValue, label: inputValue });
            }
            break;
          }
          case "Escape": {
            if (isOpen) {
              event.preventDefault();
              onClose();
            } else if (value !== null || inputValue !== "") {
              event.preventDefault();
              clearSelection();
            }
            break;
          }
          case "Tab": {
            if (isOpen) onClose();
            break;
          }
        }
      },
      [
        clearSelection,
        clearOnSelect,
        disabled,
        freeSolo,
        getEnabledItemValues,
        getOption,
        highlightedValue,
        inputValue,
        isOpen,
        onClose,
        onHighlight,
        onOpen,
        onValueChange,
        readOnly,
        selectOption,
        value,
        ctx.loopFocus,
        ctx.inputBehavior,
        ctx.openOnKeyPress,
        ctx.completeOption,
        ctx.getItemElement,
      ],
    );

    const activeDescendant = highlightedValue !== null
      ? getItemId(highlightedValue)
      : undefined;

    const inputProps = {
      ...restProps,
      ref: composedRef,
      id: restProps.id ?? ctx.inputId,
      type: "text",
      role: "combobox",
      value: inputValue,
      autoComplete,
      form,
      disabled: disabled || undefined,
      readOnly: readOnly || undefined,
      "aria-expanded": isOpen,
      "aria-haspopup": "listbox",
      "aria-controls": listboxId,
      "aria-activedescendant": isOpen ? activeDescendant : undefined,
      "aria-autocomplete": "list",
      "aria-invalid": invalid || undefined,
      "aria-required": restProps["aria-required"] ?? (required || undefined),
      "aria-labelledby": restProps["aria-labelledby"] ??
        (restProps["aria-label"] === undefined ? fieldLabelId : undefined),
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : fieldDescribedBy,
      "data-slot": dataSlot,
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
      "data-readonly": readOnly ? "" : undefined,
      "data-invalid": invalid ? "" : undefined,
      onChange: composeEventHandlers(onChange, handleChange),
      onFocus: composeEventHandlers(onFocus, handleFocus),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      onClick: composeEventHandlers(onClick, () => { if (ctx.openOnClick) onOpen(); }),
    };

    if (asChild) return cloneAndMerge(children, inputProps);

    return renderElement(render, "input", inputProps);
  },
);
