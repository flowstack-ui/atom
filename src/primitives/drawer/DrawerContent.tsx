"use client";

import { forwardRef, type ReactNode } from "react";
import { FocusScopeProvider } from "../../hooks/focus.js";
import { getModalPartPresence } from "../modal/parts.js";
import { useModalContentWithParts } from "../modal/useModalContent.js";
import type {
  ModalFinalFocusDetails,
  ModalInitialFocusDetails,
} from "../modal/context.js";
import type { ModalFocusTarget } from "../modal/useModalContent.js";
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
  /** Initial focus target. `false` disables automatic initial focus. */
  initialFocus?: ModalFocusTarget<ModalInitialFocusDetails>;
  /** Final focus target. `false` disables automatic focus restoration. */
  finalFocus?: ModalFocusTarget<ModalFinalFocusDetails>;
  /** Slot override for the drawer panel. */
  "data-slot"?: string;
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent(props, ref) {
    const {
      children,
      placement,
      ariaLabel,
      initialFocus,
      finalFocus,
      "aria-label": ariaLabelNative,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      className,
      "data-slot": dataSlot = "drawer-content",
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
        data-placement={placement}
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
