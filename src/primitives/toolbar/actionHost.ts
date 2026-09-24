import { cloneElement, isValidElement, type ReactNode, type MouseEvent, type KeyboardEvent } from "react";
import type { RenderProp } from "../../utils/slot.js";

/** Run element-authored handlers before owned activation, not after slot merge. */
export function toolbarActionHost(children: ReactNode, render: RenderProp | undefined, asChild: boolean | undefined) {
  const element = asChild ? children : render;
  const props = isValidElement<Record<string, unknown>>(element) ? element.props : {};
  const clean = isValidElement<Record<string, unknown>>(element)
    ? cloneElement(element, { onClick: undefined, onKeyDown: undefined, onPress: undefined }) : element;
  return {
    children: asChild ? clean as ReactNode : children,
    render: asChild ? render : clean as RenderProp | undefined,
    disabled: Boolean(props.disabled || props.loading || props["aria-disabled"] === true || props["aria-disabled"] === "true"),
    onClick: props.onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined,
    onPress: props.onPress as ((event: MouseEvent<HTMLElement>) => void) | undefined,
    onKeyDown: props.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined,
  };
}
