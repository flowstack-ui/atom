import { cloneElement, isValidElement, type ReactNode, type MouseEventHandler, type KeyboardEventHandler } from "react";
import type { RenderProp } from "../../utils/slot.js";

/** Consume host activation once, before checkbox behavior, so cancellation works. */
export function checkboxComposedHost(children: ReactNode, render: RenderProp | undefined, asChild: boolean | undefined) {
  const element = asChild ? children : render;
  const props = isValidElement<Record<string, unknown>>(element) ? element.props : {};
  const clean = isValidElement<Record<string, unknown>>(element)
    ? cloneElement(element, { onClick: undefined, onKeyDown: undefined }) : element;
  return {
    children: asChild ? clean as ReactNode : children,
    render: asChild ? render : clean as RenderProp | undefined,
    disabled: Boolean(props.disabled || props["aria-disabled"] === true || props["aria-disabled"] === "true"),
    onClick: props.onClick as MouseEventHandler<HTMLButtonElement> | undefined,
    onKeyDown: props.onKeyDown as KeyboardEventHandler<HTMLButtonElement> | undefined,
  };
}
