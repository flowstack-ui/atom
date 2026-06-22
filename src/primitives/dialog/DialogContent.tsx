"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import { FocusScopeProvider } from "../../hooks/focus.js";
import { useModalContent } from "../modal/useModalContent.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";

type DialogContentNativeProps = NativeDivProps<"children" | "role">;

export interface DialogContentProps extends DialogContentNativeProps {
  /** Dialog content. */
  children: ReactNode;
  /** Fallback accessible label. */
  ariaLabel?: string;
  /** ARIA role for the content element. */
  role?: "dialog" | "alertdialog";
  /** CSS class for the content element. */
  className?: string;
  /** Slot override for the content element. */
  "data-slot"?: string;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    {
      children,
      ariaLabel,
      role = "dialog",
      className,
      "data-slot": dataSlot = "dialog-content",
      ...restProps
    },
    ref,
  ) {
    const {
      isPresent,
      isHidden,
      isPositioned,
      dataState,
      focusScope,
      presenceRef,
      contentProps,
    } = useModalContent({ role, ariaLabel });
    const contentRef = useMemo(
      () => composeRefs(presenceRef, ref),
      [presenceRef, ref],
    );

    if (!isPresent) return null;

    if (isHidden) {
      return (
        <div hidden aria-hidden="true">
          <div
            {...restProps}
            ref={contentRef}
            {...contentProps}
            data-slot={dataSlot}
            data-state="closed"
            className={className}
          >
            <FocusScopeProvider scope={focusScope}>
              {children}
            </FocusScopeProvider>
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
        {...(isPositioned ? { "data-positioned": "" } : {})}
        className={className}
      >
        <FocusScopeProvider scope={focusScope}>
          {children}
        </FocusScopeProvider>
      </div>
    );
  },
);
