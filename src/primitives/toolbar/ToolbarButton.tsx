"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useToolbarItem } from "./useToolbarItem.js";

type ToolbarButtonNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface ToolbarButtonProps extends ToolbarButtonNativeProps {
  /** Button content. */
  children?: ReactNode;
  /** Disable this button. */
  disabled?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Accessible label. */
  ariaLabel?: string;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    {
      children,
      disabled = false,
      onClick,
      className,
      ariaLabel,
      onFocus,
      ...restProps
    },
    ref,
  ) {
    const { itemRef, tabIndex, handleFocus } = useToolbarItem(disabled);
    const composedRef = useMemo(() => composeRefs(itemRef, ref), [itemRef, ref]);

    return (
      <button
        {...restProps}
        ref={composedRef}
        type="button"
        disabled={disabled}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        data-slot="toolbar-button"
        {...(disabled ? { "data-disabled": "" } : {})}
        className={className}
        onClick={onClick}
        onFocus={composeEventHandlers(onFocus, () => handleFocus())}
      >
        {children}
      </button>
    );
  },
);
