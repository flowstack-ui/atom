"use client";

import {
  forwardRef,
  useCallback,
  type AnchorHTMLAttributes,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  hasNativeButtonKeyboardActivation,
  renderHasNativeButtonSemantics,
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
    const isNativeButton = !asChild && render === undefined && href === undefined;
    const isDisabledDefaultAnchor =
      !asChild && render === undefined && href !== undefined && isInactive;
    const needsButtonSemantics =
      !asChild &&
      href === undefined &&
      render !== undefined &&
      !renderHasNativeButtonSemantics(render);
    const resolvedRel = getSafeRel({ rel, target });

    const handleClick = useCallback<MouseEventHandler<HTMLElement>>(
      (event) => {
        if (isInactive) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
        if (event.defaultPrevented) return;

        onPress?.(event);
      },
      [isInactive, onClick, onPress],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        if (!isButtonActivationKey(event.key)) {
          onKeyDown?.(event);
          return;
        }

        if (isInactive) {
          event.preventDefault();
          return;
        }

        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        if (hasNativeButtonKeyboardActivation(event.currentTarget, event.key)) {
          return;
        }

        event.preventDefault();
        event.currentTarget.click();
      },
      [isInactive, onKeyDown],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(href !== undefined && !isInactive ? { href } : {}),
      ...(target !== undefined && !isInactive ? { target } : {}),
      ...(resolvedRel !== undefined && !isInactive ? { rel: resolvedRel } : {}),
      ...(isNativeButton ? { type, disabled: disabled || undefined } : {}),
      ...(isDisabledDefaultAnchor ? { role: "link", tabIndex: 0 } : {}),
      ...(needsButtonSemantics ? { role: "button", tabIndex: 0 } : {}),
      "aria-disabled": !isNativeButton && isInactive ? true : undefined,
      "aria-busy": loading || undefined,
      "data-slot": dataSlot,
      ...(disabled && { "data-disabled": "" }),
      ...(loading && { "data-loading": "" }),
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, defaultTag, {
      ...behaviorProps,
      children,
    });
  },
);
