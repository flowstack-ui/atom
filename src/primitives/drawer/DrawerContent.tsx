"use client";

import { forwardRef, type ReactNode } from "react";
import { useModalContent } from "../modal/useModalContent.js";
import { composeRefs } from "../../utils/slot.js";
import type { NativeDivProps } from "../../utils/dom.js";

type DrawerContentNativeProps = NativeDivProps<"children">;

export interface DrawerContentProps extends DrawerContentNativeProps {
  /** Drawer content. */
  children: ReactNode;
  /** Placement value exposed as data-placement. */
  placement?: string;
  /** Fallback accessible label. */
  ariaLabel?: string;
  /** Slot override for the drawer panel. */
  "data-slot"?: string;
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent(
    {
      children,
      placement,
      ariaLabel,
      className,
      "data-slot": dataSlot = "drawer-content",
      ...restProps
    },
    ref,
  ) {
    const {
      isPresent,
      isHidden,
      isPositioned,
      dataState,
      presenceRef,
      contentProps,
    } = useModalContent({ ariaLabel });

    if (!isPresent) return null;

    const contentRef = composeRefs(presenceRef, ref);

    if (isHidden) {
      return (
        <div hidden aria-hidden="true">
          <div
            {...restProps}
            ref={contentRef}
            {...contentProps}
            data-slot={dataSlot}
            data-state="closed"
            data-placement={placement}
            className={className}
          >
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        {...restProps}
        ref={contentRef}
        {...contentProps}
        data-slot={dataSlot}
        data-state={dataState}
        data-placement={placement}
        {...(isPositioned ? { "data-positioned": "" } : {})}
        className={className}
      >
        {children}
      </div>
    );
  },
);
