"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFileUploadItemContext } from "./context.js";
import { formatFileSize } from "./utils.js";

type FileUploadItemSizeNativeProps = NativeSpanProps<"children">;

export interface FileUploadItemSizeProps extends FileUploadItemSizeNativeProps {
  locale?: string;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FileUploadItemSize = forwardRef<HTMLSpanElement, FileUploadItemSizeProps>(
  function FileUploadItemSize(
    {
      children,
      locale,
      render,
      asChild,
      "data-slot": dataSlot = "file-upload-item-size",
      ...restProps
    },
    ref,
  ) {
    const { file } = useFileUploadItemContext();
    const content = children ?? formatFileSize(file.size, locale);
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-size": file.size,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "span", {
      ...behaviorProps,
      children: content,
    });
  },
);
