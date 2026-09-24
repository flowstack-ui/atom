"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeListProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFileUploadContext } from "./context.js";

type FileUploadItemGroupNativeProps = NativeListProps<"children">;

export interface FileUploadItemGroupProps extends FileUploadItemGroupNativeProps {
  type?: "accepted" | "rejected";
  children?: ReactNode | ((file: File, index: number) => ReactNode);
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function isFunctionChild(
  children: FileUploadItemGroupProps["children"],
): children is (file: File, index: number) => ReactNode {
  return typeof children === "function";
}

export const FileUploadItemGroup = forwardRef<HTMLUListElement, FileUploadItemGroupProps>(
  function FileUploadItemGroup(
    {
      children,
      type = "accepted",
      render,
      asChild,
      "data-slot": dataSlot = "file-upload-item-group",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFileUploadContext();
    const files = type === "rejected" ? ctx.rejectedFiles.map((entry) => entry.file) : ctx.files;
    const hasFunctionChild = isFunctionChild(children);
    const content = hasFunctionChild
      ? files.map((file, index) => children(file, index))
      : children;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-count": files.length,
      ...(files.length > 0 && { "data-filled": "" }),
    };

    if (asChild) {
      if (hasFunctionChild) {
        throw new Error(
          "FileUpload.ItemGroup cannot use asChild with function children. Render an element child or omit asChild.",
        );
      }

      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "ul", {
      ...behaviorProps,
      children: content,
    });
  },
);
