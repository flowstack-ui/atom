import {
  cloneElement,
  isValidElement,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { RenderProp } from "../../utils/slot.js";

/** Consume host activation once so authored handlers can cancel Atom behavior. */
export function switchComposedHost(
  children: ReactNode,
  render: RenderProp | undefined,
  asChild: boolean | undefined,
) {
  const element = asChild ? children : render;
  const props = isValidElement<Record<string, unknown>>(element) ? element.props : {};
  const clean = isValidElement<Record<string, unknown>>(element)
    ? cloneElement(element, { onClick: undefined, onKeyDown: undefined })
    : element;

  return {
    children: asChild ? clean as ReactNode : children,
    render: asChild ? render : clean as RenderProp | undefined,
    disabled: Boolean(
      props.disabled ||
      props["aria-disabled"] === true ||
      props["aria-disabled"] === "true"
    ),
    onClick: props.onClick as MouseEventHandler<HTMLElement> | undefined,
    onKeyDown: props.onKeyDown as KeyboardEventHandler<HTMLElement> | undefined,
  };
}
