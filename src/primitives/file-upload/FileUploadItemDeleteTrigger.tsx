"use client";

import {
  forwardRef,
  useCallback,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  useFileUploadContext,
  useFileUploadItemContext,
} from "./context.js";

type FileUploadItemDeleteTriggerNativeProps = NativeButtonProps<
  "children" | "disabled" | "onClick" | "type"
>;

export interface FileUploadItemDeleteTriggerProps extends FileUploadItemDeleteTriggerNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "data-slot"?: string;
}

export const FileUploadItemDeleteTrigger = forwardRef<
  HTMLButtonElement,
  FileUploadItemDeleteTriggerProps
>(function FileUploadItemDeleteTrigger(
  {
    children,
    render,
    asChild,
    onClick,
    "aria-label": ariaLabel,
    "data-slot": dataSlot = "file-upload-item-delete-trigger",
    ...restProps
  },
  ref,
) {
  const ctx = useFileUploadContext();
  const itemCtx = useFileUploadItemContext();
  const {
    disabled,
    readOnly,
    removeFile,
  } = ctx;
  const { file } = itemCtx;
  const isInactive = disabled || readOnly;

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      if (isInactive) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
      if (event.defaultPrevented) return;

      removeFile(file);
    },
    [file, isInactive, onClick, removeFile],
  );

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    type: "button",
    disabled: isInactive || undefined,
    "aria-label": ariaLabel ?? `Remove ${file.name}`,
    "data-slot": dataSlot,
    ...(isInactive && { "data-disabled": "" }),
    onClick: handleClick,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "button", {
    ...behaviorProps,
    children,
  });
});
