"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
  type FocusEventHandler,
  type ReactNode,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { composeEventHandlers } from "../../utils/dom.js";
import type { NativeTextareaProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useFieldContext } from "../field/context.js";
import {
  TextareaContextProvider,
  type TextareaContextValue,
} from "./context.js";

type TextareaRootNativeProps = NativeTextareaProps<
  | "children"
  | "defaultValue"
  | "disabled"
  | "onChange"
  | "readOnly"
  | "required"
  | "value"
  | "aria-invalid"
  | "aria-readonly"
  | "aria-required"
>;

export interface TextareaRootProps extends TextareaRootNativeProps {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  "data-slot"?: string;
}

function getRowHeight(element: HTMLTextAreaElement): number {
  const style = getComputedStyle(element);
  const lineHeight = Number.parseFloat(style.lineHeight);
  if (Number.isFinite(lineHeight)) return lineHeight;
  const fontSize = Number.parseFloat(style.fontSize);
  if (Number.isFinite(fontSize)) return fontSize * 1.2;
  return 20;
}

function getVerticalChrome(element: HTMLTextAreaElement): number {
  const style = getComputedStyle(element);
  return [
    style.paddingTop,
    style.paddingBottom,
    style.borderTopWidth,
    style.borderBottomWidth,
  ].reduce((total, value) => total + (Number.parseFloat(value) || 0), 0);
}

export const TextareaRoot = forwardRef<HTMLTextAreaElement, TextareaRootProps>(
  function TextareaRoot(
    {
      children,
      value,
      defaultValue = "",
      onValueChange,
      invalid,
      disabled,
      required,
      readOnly,
      autoResize = false,
      minRows,
      maxRows,
      rows,
      id,
      onChange,
      onFocus,
      onBlur,
      "aria-describedby": ariaDescribedBy,
      "data-slot": dataSlot = "textarea",
      ...restProps
    },
    ref,
  ) {
    const fieldCtx = useFieldContext();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const composedRef = useMemo(() => composeRefs(textareaRef, ref), [ref]);
    const [focused, setFocused] = useState(false);
    const [resolvedValue, setResolvedValue] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const isDisabled = disabled ?? fieldCtx?.disabled ?? false;
    const isRequired = required ?? fieldCtx?.required ?? false;
    const isReadOnly = readOnly ?? fieldCtx?.readOnly ?? false;
    const isInvalid = invalid ?? fieldCtx?.invalid ?? false;
    const controlId = id ?? fieldCtx?.controlId;
    const describedBy = ariaDescribedBy ?? fieldCtx?.describedBy;
    const normalizedMinRows = minRows && minRows > 0 ? Math.max(1, Math.floor(minRows)) : undefined;
    const normalizedMaxRows = maxRows && maxRows > 0 ? Math.max(1, Math.floor(maxRows)) : undefined;

    useEffect(() => {
      const element = textareaRef.current;
      if (!element) return;

      if (!autoResize) {
        element.style.height = "";
        element.style.minHeight = "";
        element.style.maxHeight = "";
        element.style.overflowY = "";
        return;
      }

      const rowHeight = getRowHeight(element);
      const chrome = getVerticalChrome(element);
      const minHeight = normalizedMinRows ? rowHeight * normalizedMinRows + chrome : undefined;
      const maxHeight = normalizedMaxRows ? rowHeight * normalizedMaxRows + chrome : undefined;

      element.style.height = "auto";
      element.style.minHeight = minHeight === undefined ? "" : `${minHeight}px`;
      element.style.maxHeight = maxHeight === undefined ? "" : `${maxHeight}px`;

      const nextHeight = maxHeight === undefined
        ? element.scrollHeight
        : Math.min(element.scrollHeight, maxHeight);
      element.style.height = `${nextHeight}px`;
      element.style.overflowY =
        maxHeight !== undefined && element.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [autoResize, normalizedMaxRows, normalizedMinRows, resolvedValue]);

    const handleChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(
      (event) => {
        setResolvedValue(event.currentTarget.value);
      },
      [setResolvedValue],
    );

    const handleFocus = useCallback<FocusEventHandler<HTMLTextAreaElement>>(() => {
      setFocused(true);
    }, []);

    const handleBlur = useCallback<FocusEventHandler<HTMLTextAreaElement>>(() => {
      setFocused(false);
    }, []);

    const contextValue = useMemo<TextareaContextValue>(
      () => ({
        value: resolvedValue,
        setValue: setResolvedValue,
        textareaRef,
        disabled: isDisabled,
        readOnly: isReadOnly,
        invalid: isInvalid,
        required: isRequired,
        focused,
        maxLength: restProps.maxLength,
      }),
      [
        focused,
        isDisabled,
        isInvalid,
        isReadOnly,
        isRequired,
        resolvedValue,
        restProps.maxLength,
        setResolvedValue,
      ],
    );

    const behaviorProps = {
      ...restProps,
      ref: composedRef,
      id: controlId,
      value: resolvedValue,
      rows: rows ?? normalizedMinRows,
      disabled: isDisabled || undefined,
      readOnly: isReadOnly || undefined,
      required: isRequired || undefined,
      "aria-describedby": describedBy,
      "aria-invalid": isInvalid || undefined,
      "aria-readonly": isReadOnly || undefined,
      "aria-required": isRequired || undefined,
      "data-slot": dataSlot,
      ...(resolvedValue !== "" && { "data-filled": "" }),
      ...(focused && { "data-focused": "" }),
      ...(isDisabled && { "data-disabled": "" }),
      ...(isReadOnly && { "data-readonly": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      ...(autoResize && { "data-autoresize": "" }),
      onChange: composeEventHandlers(onChange, handleChange),
      onFocus: composeEventHandlers(onFocus, handleFocus),
      onBlur: composeEventHandlers(onBlur, handleBlur),
    };

    return (
      <TextareaContextProvider value={contextValue}>
        <textarea {...behaviorProps} />
        {children}
      </TextareaContextProvider>
    );
  },
);
