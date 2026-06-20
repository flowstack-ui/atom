"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFileUploadItemContext } from "./context.js";

type FileUploadItemNameNativeProps = NativeSpanProps<"children">;

export interface FileUploadItemNameProps extends FileUploadItemNameNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FileUploadItemName = forwardRef<HTMLSpanElement, FileUploadItemNameProps>(
  function FileUploadItemName(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "file-upload-item-name",
      ...restProps
    },
    ref,
  ) {
    const { file } = useFileUploadItemContext();
    const content = children ?? file.name;
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, {
        ...behaviorProps,
        children: content,
      });
    }

    return renderElement(render, "span", {
      ...behaviorProps,
      children: content,
    });
  },
);
