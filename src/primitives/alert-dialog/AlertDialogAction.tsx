"use client";

import {
  forwardRef,
  useCallback,
  type MouseEventHandler,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useModalContext } from "../modal/index.js";
import {
  getModalPointerInteractionType,
  isModalActivationKey,
} from "../modal/interaction.js";

type AlertDialogActionNativeProps = NativeButtonProps<"children" | "type">;

export interface AlertDialogActionProps extends AlertDialogActionNativeProps {
  /** Action control content. */
  children: ReactNode;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AlertDialogAction = forwardRef<HTMLElement, AlertDialogActionProps>(
  function AlertDialogAction(
    {
      children,
      asChild = false,
      render,
      onClick,
      onKeyDown,
      onPointerDown,
      onPointerCancel,
      "data-slot": dataSlot = "alert-dialog-action",
      ...restProps
    },
    ref,
  ) {
    const {
      onClose,
      recordInteraction,
      consumeInteraction,
      clearInteraction,
    } = useModalContext();

    const handleClick: MouseEventHandler<HTMLElement> = useCallback((event) => {
      (onClick as MouseEventHandler<HTMLElement> | undefined)?.(event);
      const interactionType = consumeInteraction(event.currentTarget);
      if (!event.defaultPrevented) onClose("actionClick", interactionType);
    }, [consumeInteraction, onClick, onClose]);
    const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
      (event) => {
        if (isModalActivationKey(event.key)) {
          recordInteraction("keyboard", event.currentTarget);
        }
      },
      [recordInteraction],
    );
    const handlePointerDown: PointerEventHandler<HTMLElement> = useCallback(
      (event) => recordInteraction(
        getModalPointerInteractionType(event.pointerType),
        event.currentTarget,
      ),
      [recordInteraction],
    );
    const handlePointerCancel: PointerEventHandler<HTMLElement> = useCallback(
      (event) => clearInteraction(event.currentTarget),
      [clearInteraction],
    );

    const behaviorProps = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      onClick: handleClick,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      onPointerDown: composeEventHandlers(onPointerDown, handlePointerDown),
      onPointerCancel: composeEventHandlers(onPointerCancel, handlePointerCancel),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", {
      ...behaviorProps,
      type: "button",
      children,
    });
  },
);
