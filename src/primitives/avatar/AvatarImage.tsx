"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeImageProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useAvatarContext } from "./context.js";

type AvatarImageNativeProps = NativeImageProps<"src" | "alt" | "children">;

export interface AvatarImageProps extends AvatarImageNativeProps {
  /** Image source URL. */
  src: string;
  /** Alt text for the image. */
  alt?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Child element used when asChild is true. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage(
    {
      src,
      alt = "",
      render,
      asChild,
      children,
      "data-slot": dataSlot = "avatar-image",
      ...rest
    },
    ref,
  ) {
    const { status } = useAvatarContext();

    if (status !== "loaded") return null;

    const behaviorProps: Record<string, unknown> = {
      ...rest,
      ref,
      src,
      alt,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "img", behaviorProps);
  },
);
