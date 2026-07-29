"use client";

import {
  forwardRef,
  useCallback,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  childHasNativeButtonSemantics,
  childIsNativeButton,
  renderHasNativeButtonSemantics,
  renderIsNativeButton,
} from "../../utils/native-semantics.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useFileUploadContext } from "./context.js";

type FileUploadTriggerNativeProps = NativeButtonProps<
  "children" | "disabled" | "onClick" | "onKeyDown" | "type"
>;

export interface FileUploadTriggerProps extends FileUploadTriggerNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  "data-slot"?: string;
}

export const FileUploadTrigger = forwardRef<HTMLElement, FileUploadTriggerProps>(
  function FileUploadTrigger(
    {
      children,
      render,
      asChild,
      onClick,
      onKeyDown,
      "data-slot": dataSlot = "file-upload-trigger",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFileUploadContext();
    const {
      disabled,
      openFilePicker,
      readOnly,
    } = ctx;
    const isInactive = disabled || readOnly;
    const isDefaultButton = !asChild && render === undefined;
    const hasNativeSemantics = isDefaultButton ||
      (asChild ? childHasNativeButtonSemantics(children) : renderHasNativeButtonSemantics(render));
    const isNativeButton = isDefaultButton ||
      (asChild ? childIsNativeButton(children) : renderIsNativeButton(render));
    const triggerId = restProps.id ?? ctx.triggerId;
    const ariaLabel = restProps["aria-label"];
    const ariaLabelledBy = restProps["aria-labelledby"] ??
      (ariaLabel ? undefined : ctx.labelId ? `${ctx.labelId} ${triggerId}` : undefined);

    const handleClick = useCallback<MouseEventHandler<HTMLElement>>(
      (event) => {
        if (isInactive) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
        if (event.defaultPrevented) return;

        openFilePicker();
      },
      [isInactive, onClick, openFilePicker],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        if (isInactive) {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
          }
          return;
        }

        if (hasNativeSemantics || (event.key !== " " && event.key !== "Enter")) {
          onKeyDown?.(event);
          return;
        }

        event.preventDefault();
        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        openFilePicker();
      },
      [hasNativeSemantics, isInactive, onKeyDown, openFilePicker],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(ctx.triggerRef, ref),
      id: triggerId,
      ...(isNativeButton
        ? { type: "button", disabled: isInactive || undefined }
        : { role: "button", tabIndex: 0, "aria-disabled": isInactive || undefined }),
      "data-slot": dataSlot,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": restProps["aria-describedby"] ?? ctx.describedBy,
      "aria-invalid": ctx.invalid || undefined,
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "data-readonly": "" }),
      ...(ctx.required && { "data-required": "" }),
      ...(ctx.invalid && { "data-invalid": "" }),
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", {
      ...behaviorProps,
      children,
    });
  },
);
