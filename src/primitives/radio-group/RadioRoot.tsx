"use client";

import {
  forwardRef,
  cloneElement,
  isValidElement,
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { useRadioGroupContext } from "./context.js";

type RadioRootNativeProps = NativeButtonProps<
  "children" | "disabled" | "onChange" | "role" | "type" | "value"
>;

const hiddenInputStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

export interface RadioRootProps extends RadioRootNativeProps {
  /** Radio value, unique within the group. */
  value: string;
  /** Per-item disabled state. */
  disabled?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Visual content rendered by the styled layer. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const RadioRoot = forwardRef<HTMLButtonElement, RadioRootProps>(
  function RadioRoot(
    {
      value,
      disabled = false,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "radio",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const context = useRadioGroupContext();
    const host = asChild ? children : render;
    const hostProps = isValidElement<Record<string, unknown>>(host) ? host.props : {};
    const cleanHost = isValidElement<Record<string, unknown>>(host) ? cloneElement(host, { onClick: undefined }) : host;
    const internalRef = useRef<HTMLElement | null>(null);
    const registeredValueRef = useRef<string | null>(null);
    const registeredNodeRef = useRef<HTMLElement | null>(null);

    const isChecked = context.activeValue === value;
    const isDisabled = disabled || context.disabled || Boolean(hostProps.disabled || hostProps["aria-disabled"] === true || hostProps["aria-disabled"] === "true");
    const isInvalid = context.invalid;

    const setRadioRef = useCallback(
      (node: HTMLElement | null) => {
        internalRef.current = node;

        if (!node) return;

        if (
          registeredValueRef.current === value &&
          registeredNodeRef.current === node
        ) {
          return;
        }

        if (registeredValueRef.current !== null) {
          context.unregisterRadio(registeredValueRef.current);
        }

        context.registerRadio(value, node);
        registeredValueRef.current = value;
        registeredNodeRef.current = node;
      },
      [context.registerRadio, context.unregisterRadio, value],
    );
    const mergedRef = useMemo(() => composeRefs(setRadioRef, ref), [setRadioRef, ref]);

    useEffect(() => {
      return () => {
        if (registeredValueRef.current !== null) {
          context.unregisterRadio(registeredValueRef.current);
          registeredValueRef.current = null;
          registeredNodeRef.current = null;
        }
      };
    }, [context.unregisterRadio]);

    const tabIndex = !isDisabled && (context.entryValue === value || (context.entryValue === undefined && isChecked)) ? 0 : -1;

    const select: MouseEventHandler<HTMLButtonElement> = () => {
      if (!isDisabled && !context.readOnly) {
        context.setActiveValue(value);
      }
    };

    // Native button props pass through first; group state and roving focus stay authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: mergedRef,
      type: "button",
      role: "radio",
      "aria-checked": isChecked,
      "aria-disabled": isDisabled || undefined,
      "aria-invalid": isInvalid || undefined,
      tabIndex,
      disabled: isDisabled || undefined,
      "data-state": isChecked ? "checked" : "unchecked",
      "data-slot": dataSlot,
      "data-value": value,
      ...(isDisabled && { "data-disabled": "" }),
      ...(context.readOnly && { "data-readonly": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      className,
      onClick: composeEventHandlers(onClick, composeEventHandlers(hostProps.onClick as MouseEventHandler<HTMLButtonElement> | undefined, select)),
    };

    const radioElement = asChild
      ? cloneAndMerge(cleanHost as ReactNode, behaviorProps)
      : renderElement(cleanHost as RenderProp | undefined, "button", { ...behaviorProps, children });

    return (
      <>
        {radioElement}
        {context.name !== undefined ? (
          <input
            type="radio"
            aria-hidden="true"
            tabIndex={-1}
            name={context.name}
            value={value}
            form={context.form}
            checked={isChecked}
            disabled={isDisabled}
            readOnly
            style={hiddenInputStyle}
          />
        ) : null}
      </>
    );
  },
);
