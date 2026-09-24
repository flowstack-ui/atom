"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
  type FocusEventHandler,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { composeEventHandlers } from "../../utils/dom.js";
import type { NativeTextareaProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useFieldContext } from "../field/context.js";
import type { ValidationBehavior } from "../form/validation.js";
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
  validationBehavior?: ValidationBehavior;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  "data-slot"?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type OwnedDimensionStyles = Pick<
  CSSProperties,
  "height" | "maxHeight" | "minHeight" | "overflowY"
>;

function serializeDimension(
  value: CSSProperties["height"] | CSSProperties["overflowY"],
): string {
  if (value === undefined || value === null) return "";
  return typeof value === "number" && value !== 0 ? `${value}px` : String(value);
}

function authoredDimensions(style: CSSProperties | undefined): Record<keyof OwnedDimensionStyles, string> {
  return {
    height: serializeDimension(style?.height),
    minHeight: serializeDimension(style?.minHeight),
    maxHeight: serializeDimension(style?.maxHeight),
    overflowY: serializeDimension(style?.overflowY),
  };
}

function applyDimensions(
  element: HTMLTextAreaElement,
  dimensions: Record<keyof OwnedDimensionStyles, string>,
) {
  element.style.height = dimensions.height;
  element.style.minHeight = dimensions.minHeight;
  element.style.maxHeight = dimensions.maxHeight;
  element.style.overflowY = dimensions.overflowY;
}

function getRowHeight(element: HTMLTextAreaElement, view: Window): number {
  const style = view.getComputedStyle(element);
  const lineHeight = Number.parseFloat(style.lineHeight);
  if (Number.isFinite(lineHeight)) return lineHeight;
  const fontSize = Number.parseFloat(style.fontSize);
  if (Number.isFinite(fontSize)) return fontSize * 1.2;
  return 20;
}

function pixels(value: string): number | undefined {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeRows(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? Math.max(1, Math.floor(value))
    : undefined;
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
      validationBehavior,
      autoResize = false,
      minRows,
      maxRows,
      rows,
      style,
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
    const reset = useCallback(() => setResolvedValue(defaultValue), [defaultValue, setResolvedValue]);
    useFormReset(textareaRef, restProps.form, value !== undefined, reset);
    const isDisabled = disabled ?? fieldCtx?.disabled ?? false;
    const isRequired = required ?? fieldCtx?.required ?? false;
    const isReadOnly = readOnly ?? fieldCtx?.readOnly ?? false;
    const validation = useFormValidation({
      validityRef: textareaRef,
      ownerRef: textareaRef,
      invalid,
      inheritedInvalid: fieldCtx?.invalid,
      validationBehavior,
      inheritedValidationBehavior: fieldCtx?.validationBehavior,
      form: restProps.form,
      reportValidity: fieldCtx?.reportControlValidity,
    });
    const isInvalid = validation.invalid;
    const controlId = id ?? fieldCtx?.controlId;
    const describedBy = ariaDescribedBy !== undefined
      ? ariaDescribedBy
      : fieldCtx?.describedBy;
    const normalizedMinRows = normalizeRows(minRows);
    const candidateMaxRows = normalizeRows(maxRows);
    const normalizedMaxRows = candidateMaxRows === undefined
      ? undefined
      : Math.max(candidateMaxRows, normalizedMinRows ?? 1);
    const dimensionsRef = useRef(authoredDimensions(style));
    dimensionsRef.current = authoredDimensions(style);

    useIsomorphicLayoutEffect(() => {
      const element = textareaRef.current;
      if (!element) return;

      if (!autoResize) {
        applyDimensions(element, dimensionsRef.current);
        return;
      }

      const view = element.ownerDocument.defaultView;
      if (!view) return;
      let frame = 0;
      let disposed = false;
      let observedInlineSize: number | undefined;

      const measure = () => {
        frame = 0;
        if (disposed || !element.isConnected) return;

        const scrollTop = element.scrollTop;
        const scrollLeft = element.scrollLeft;

        // Restore the current authored values before reading computed CSS. This
        // prevents an earlier measurement from becoming the next constraint.
        applyDimensions(element, dimensionsRef.current);
        const computed = view.getComputedStyle(element);
        if (computed.display === "none") return;

        const padding = (pixels(computed.paddingTop) ?? 0) + (pixels(computed.paddingBottom) ?? 0);
        const borders = (pixels(computed.borderTopWidth) ?? 0) + (pixels(computed.borderBottomWidth) ?? 0);
        const chrome = padding + borders;
        const toBorderBox = (value: string) => {
          const parsed = pixels(value);
          if (parsed === undefined) return undefined;
          return computed.boxSizing === "border-box" ? parsed : parsed + chrome;
        };
        const authoredMin = toBorderBox(computed.minHeight) ?? 0;
        const authoredMax = computed.maxHeight === "none"
          ? Number.POSITIVE_INFINITY
          : toBorderBox(computed.maxHeight) ?? Number.POSITIVE_INFINITY;
        const rowHeight = getRowHeight(element, view);
        const rowMin = normalizedMinRows === undefined ? 0 : rowHeight * normalizedMinRows + chrome;
        const rowMax = normalizedMaxRows === undefined
          ? Number.POSITIVE_INFINITY
          : rowHeight * normalizedMaxRows + chrome;
        const effectiveMin = Math.max(authoredMin, rowMin);
        const effectiveMax = Math.max(effectiveMin, Math.min(authoredMax, rowMax));

        element.style.height = "0px";
        element.style.minHeight = "0px";
        element.style.maxHeight = "none";
        element.style.overflowY = "hidden";
        const naturalBorderBox = element.scrollHeight + borders;
        const nextBorderBox = Math.max(effectiveMin, Math.min(naturalBorderBox, effectiveMax));
        const nextCssHeight = computed.boxSizing === "border-box"
          ? nextBorderBox
          : Math.max(0, nextBorderBox - chrome);
        const nextCssMin = computed.boxSizing === "border-box"
          ? effectiveMin
          : Math.max(0, effectiveMin - chrome);
        const nextCssMax = computed.boxSizing === "border-box"
          ? effectiveMax
          : Math.max(0, effectiveMax - chrome);

        element.style.minHeight = `${nextCssMin}px`;
        element.style.maxHeight = Number.isFinite(nextCssMax) ? `${nextCssMax}px` : "none";
        element.style.height = `${nextCssHeight}px`;
        element.style.overflowY = naturalBorderBox > effectiveMax ? "auto" : "hidden";
        element.scrollTop = scrollTop;
        element.scrollLeft = scrollLeft;
      };

      const schedule = () => {
        if (disposed || frame) return;
        frame = view.requestAnimationFrame(measure);
      };

      measure();
      const ResizeObserverConstructor = view.ResizeObserver;
      const resizeObserver = ResizeObserverConstructor
        ? new ResizeObserverConstructor((entries) => {
            const inlineSize = entries[0]?.contentRect.width;
            if (inlineSize !== observedInlineSize) {
              observedInlineSize = inlineSize;
              schedule();
            }
          })
        : undefined;
      resizeObserver?.observe(element);

      const mutationObserver = view.MutationObserver
        ? new view.MutationObserver(schedule)
        : undefined;
      mutationObserver?.observe(element, {
        attributes: true,
        attributeFilter: ["class", "hidden"],
      });

      const fonts = element.ownerDocument.fonts;
      const handleFonts = () => schedule();
      fonts?.addEventListener?.("loadingdone", handleFonts);
      void fonts?.ready?.then(handleFonts);

      return () => {
        disposed = true;
        if (frame) view.cancelAnimationFrame(frame);
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        fonts?.removeEventListener?.("loadingdone", handleFonts);
        applyDimensions(element, dimensionsRef.current);
      };
    }, [autoResize, normalizedMaxRows, normalizedMinRows, resolvedValue, style]);

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

    const consumerOnInvalid = restProps.onInvalid;
    const consumerOnInput = restProps.onInput;
    const behaviorProps = {
      ...restProps,
      style,
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
      "data-atom-validation-owner": validation.validationProps["data-atom-validation-owner"],
      "data-atom-validation-behavior": validation.validationBehavior,
      onInvalid: (event: React.FormEvent<HTMLTextAreaElement>) => {
        consumerOnInvalid?.(event);
        validation.validationProps.onInvalid(event);
      },
      onInput: (event: React.InputEvent<HTMLTextAreaElement>) => {
        consumerOnInput?.(event);
        validation.validationProps.onInput();
      },
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        composeEventHandlers(onChange, handleChange)(event);
        validation.validationProps.onChange();
      },
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
