"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import { FocusScopeProvider } from "../../hooks/focus.js";
import { getModalPartPresence } from "../modal/parts.js";
import { useModalContentWithParts } from "../modal/useModalContent.js";
import type {
  ModalFinalFocusDetails,
  ModalInitialFocusDetails,
} from "../modal/context.js";
import type { ModalFocusTarget } from "../modal/useModalContent.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";

type DialogContentNativeProps = NativeDivProps<"children" | "role">;

export interface DialogContentProps extends DialogContentNativeProps {
  /** Dialog content. */
  children: ReactNode;
  /** Fallback accessible label. */
  ariaLabel?: string;
  /** Initial focus target. `false` disables automatic initial focus. */
  initialFocus?: ModalFocusTarget<ModalInitialFocusDetails>;
  /** Final focus target. `false` disables automatic focus restoration. */
  finalFocus?: ModalFocusTarget<ModalFinalFocusDetails>;
  /** ARIA role for the content element. */
  role?: "dialog" | "alertdialog";
  /** CSS class for the content element. */
  className?: string;
  /** Slot override for the content element. */
  "data-slot"?: string;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    const {
      children,
      ariaLabel,
      initialFocus,
      finalFocus,
      "aria-label": ariaLabelNative,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      role = "dialog",
      className,
      "data-slot": dataSlot = "dialog-content",
      ...restProps
    } = props;
    const {
      isPresent,
      isHidden,
      isPositioned,
      dataState,
      focusScope,
      presenceRef,
      contentProps,
    } = useModalContentWithParts(
      {
        role,
        ariaLabel,
        initialFocus,
        finalFocus,
        "aria-label": ariaLabelNative,
        "aria-labelledby": ariaLabelledBy,
        ...(Object.prototype.hasOwnProperty.call(
          props,
          "aria-describedby",
        )
          ? { "aria-describedby": ariaDescribedBy }
          : {}),
      },
      getModalPartPresence(children),
    );
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
