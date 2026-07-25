"use client";

import {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useMemo,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import type { NativeAnchorProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useToolbarItem } from "./useToolbarItem.js";

type ToolbarLinkNativeProps = NativeAnchorProps<"children" | "href">;

function getElementProps(value: ReactNode | RenderProp | undefined): Record<string, unknown> {
  if (!isValidElement(value)) return {};
  return (value as ReactElement<Record<string, unknown>>).props;
}

export interface ToolbarLinkProps extends ToolbarLinkNativeProps {
  /** Link content. */
  children?: ReactNode;
  /** Link destination. */
  href: string;
  /** Link target. */
  target?: string;
  /** Link rel. */
  rel?: string;
  /** Disable this link. */
  disabled?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Accessible label. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ToolbarLink = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(
  function ToolbarLink(
    {
      children,
      href,
      target,
      rel,
      download,
      ping,
      referrerPolicy,
      disabled = false,
      className,
      ariaLabel,
      render,
      asChild,
      onClick,
      onFocus,
      "data-slot": dataSlot = "toolbar-link",
      ...restProps
    },
    ref,
  ) {
    const { itemRef, tabIndex, handleFocus } = useToolbarItem(disabled);
    const composedRef = useMemo(() => composeRefs(itemRef, ref), [itemRef, ref]);
    const compositionProps = asChild
      ? getElementProps(children)
      : getElementProps(render);
    const composedOnClick = compositionProps.onClick;

    const handleClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);

      if (disabled) {
        event.preventDefault();
        return;
      }

      if (typeof composedOnClick === "function") {
        composedOnClick(event);
      }
    }, [composedOnClick, disabled, onClick]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      ...(disabled
        ? {
            href: null,
            target: null,
            rel: null,
            download: null,
            ping: null,
            referrerPolicy: null,
          }
        : {
            href,
            ...(target !== undefined && { target }),
            ...(rel !== undefined && { rel }),
            ...(download !== undefined && { download }),
            ...(ping !== undefined && { ping }),
            ...(referrerPolicy !== undefined && { referrerPolicy }),
          }),
      tabIndex,
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "aria-disabled": disabled || undefined,
      "data-slot": dataSlot,
      ...(disabled ? { "data-disabled": "" } : {}),
      className,
      onClick: handleClick,
      onFocus: composeEventHandlers(onFocus, () => handleFocus()),
    };

    if (asChild) {
      const resolvedChildren = isValidElement(children)
        ? cloneElement(
            children as ReactElement<Record<string, unknown>>,
            { onClick: undefined },
          )
        : children;
      return cloneAndMerge(resolvedChildren, behaviorProps);
    }

    const resolvedRender = isValidElement(render)
      ? cloneElement(
          render as ReactElement<Record<string, unknown>>,
          { onClick: undefined },
        )
      : render;

    return renderElement(resolvedRender, "a", { ...behaviorProps, children });
  },
);
