"use client";

import {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  type AnchorHTMLAttributes,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  childHasNativeButtonSemantics,
  childIsNativeButton,
  hasNativeButtonKeyboardActivation,
  renderHasNativeButtonSemantics,
  renderIsNativeButton,
} from "../../utils/native-semantics.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type ButtonRootNativeProps = NativeButtonProps<
  | "children"
  | "disabled"
  | "onClick"
  | "onKeyDown"
  | "type"
  | "aria-busy"
  | "aria-disabled"
>;

export interface ButtonRootProps extends ButtonRootNativeProps {
  children?: ReactNode;
  href?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  disabled?: boolean;
  loading?: boolean;
  onPress?: MouseEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  type?: "button" | "submit" | "reset";
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function getSafeRel({
  rel,
  target,
}: {
  rel: string | undefined;
  target: AnchorHTMLAttributes<HTMLAnchorElement>["target"] | undefined;
}): string | undefined {
  if (target !== "_blank") return rel;
  if (!rel) return "noopener noreferrer";

  const tokens = new Set(rel.split(/\s+/).filter(Boolean));
  tokens.add("noopener");
  tokens.add("noreferrer");
  return Array.from(tokens).join(" ");
}

function isButtonActivationKey(key: string): boolean {
  return key === " " || key === "Enter";
}

function getElementProps(value: ReactNode | RenderProp | undefined): Record<string, unknown> {
  if (!isValidElement(value)) return {};
  return (value as ReactElement<Record<string, unknown>>).props;
}

export const ButtonRoot = forwardRef<HTMLElement, ButtonRootProps>(
  function ButtonRoot(
    {
      children,
      href,
      target,
      rel,
      disabled = false,
      loading = false,
      onPress,
      onClick,
      onKeyDown,
      type = "button",
      render,
      asChild,
      "data-slot": dataSlot = "button",
      ...restProps
    },
    ref,
  ) {
    const isInactive = disabled || loading;
    const defaultTag = href !== undefined ? "a" : "button";
    const compositionProps = asChild
      ? getElementProps(children)
      : getElementProps(render);
    const composedHref = compositionProps.href;
    const hasComposedHref = composedHref !== undefined && composedHref !== null;
    const hasLinkSemantics = href !== undefined || hasComposedHref;
    const isDefaultButton = !asChild && render === undefined && href === undefined;
    const hasNativeSemantics = isDefaultButton ||
      (asChild ? childHasNativeButtonSemantics(children) : renderHasNativeButtonSemantics(render));
    const isNativeButton = isDefaultButton ||
      (asChild ? childIsNativeButton(children) : renderIsNativeButton(render));
    const isLink = hasLinkSemantics && !isNativeButton;
    const needsButtonSemantics = !isLink && !hasNativeSemantics;
    const composedTarget = compositionProps.target;
    const composedRel = compositionProps.rel;
    const composedOnClick = compositionProps.onClick;
    const composedOnKeyDown = compositionProps.onKeyDown;
    const resolvedTarget = target ?? (
      typeof composedTarget === "string" ? composedTarget : undefined
    );
    const resolvedRel = getSafeRel({
      rel: rel ?? (typeof composedRel === "string" ? composedRel : undefined),
      target: resolvedTarget,
    });

    const handleClick = useCallback<MouseEventHandler<HTMLElement>>(
      (event) => {
        if (isInactive) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
        if (!event.defaultPrevented) {
          onPress?.(event);
        }

        if (typeof composedOnClick === "function") {
          composedOnClick(event);
        }
      },
      [composedOnClick, isInactive, onClick, onPress],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        if (!isButtonActivationKey(event.key)) {
          onKeyDown?.(event);
          if (typeof composedOnKeyDown === "function") {
            composedOnKeyDown(event);
          }
          return;
        }

        if (isInactive) {
          event.preventDefault();
          return;
        }

        onKeyDown?.(event);
        if (!event.defaultPrevented) {
          if (!isLink && !hasNativeButtonKeyboardActivation(event.currentTarget, event.key)) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }

        if (typeof composedOnKeyDown === "function") {
          composedOnKeyDown(event);
        }
      },
      [composedOnKeyDown, isInactive, isLink, onKeyDown],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(isLink && isInactive
        ? { href: null, target: null, rel: null }
        : {
            ...(href !== undefined ? { href } : {}),
            ...(resolvedTarget !== undefined ? { target: resolvedTarget } : {}),
            ...(resolvedRel !== undefined ? { rel: resolvedRel } : {}),
          }),
      ...(isNativeButton ? { type, disabled: disabled || undefined } : {}),
      ...(isLink && isInactive ? { role: "link", tabIndex: 0 } : {}),
      ...(needsButtonSemantics ? { role: "button", tabIndex: 0 } : {}),
      "aria-disabled": !isNativeButton && isInactive ? true : undefined,
      "aria-busy": loading || undefined,
      "data-slot": dataSlot,
      ...(disabled && { "data-disabled": "" }),
      ...(loading && { "data-loading": "" }),
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    };

    const compositionOverrides = {
      onClick: undefined,
      onKeyDown: undefined,
    };

    if (asChild) {
      const resolvedChildren = isValidElement(children)
        ? cloneElement(children, compositionOverrides)
        : children;
      return cloneAndMerge(
        resolvedChildren,
        behaviorProps,
      );
    }

    const resolvedRender = isValidElement(render)
      ? cloneElement(render, compositionOverrides)
      : render;

    return renderElement(resolvedRender, defaultTag, {
      ...behaviorProps,
      children,
    });
  },
);
