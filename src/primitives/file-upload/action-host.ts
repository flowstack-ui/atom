import { cloneElement, isValidElement, type ReactNode } from "react";
import type { RenderProp } from "../../utils/slot.js";

/** Consume composed action handlers before behavior, rather than after slot merge. */
export function fileUploadActionHost(children: ReactNode, render: RenderProp | undefined, asChild: boolean | undefined, consumeKeys = false) {
  const host = asChild ? children : render;
  const props = isValidElement<Record<string, unknown>>(host) ? host.props : {};
  const clean = isValidElement<Record<string, unknown>>(host)
    ? cloneElement(host, { onClick: undefined, onPress: undefined, ...(consumeKeys && { onKeyDown: undefined }) }) : host;
  return {
    children: asChild ? clean as ReactNode : children,
    render: asChild ? render : clean as RenderProp | undefined,
    inactive: Boolean(props.disabled || props.loading || props["aria-disabled"] === true || props["aria-disabled"] === "true"),
    id: props.id as string | undefined,
    label: props["aria-label"] as string | undefined,
    labelledBy: props["aria-labelledby"] as string | undefined,
    describedBy: props["aria-describedby"] as string | undefined,
    onClick: props.onClick as ((event: React.MouseEvent<HTMLElement>) => void) | undefined,
    onPress: props.onPress as ((event: React.MouseEvent<HTMLElement>) => void) | undefined,
    onKeyDown: props.onKeyDown as ((event: React.KeyboardEvent<HTMLElement>) => void) | undefined,
  };
}
