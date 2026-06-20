"use client";

import {
  Children,
  forwardRef,
  useMemo,
  type ReactElement,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { AvatarContext, type AvatarContextValue } from "./context.js";
import { useImageLoadingStatus, type ImageLoadingStatus } from "./useImageLoadingStatus.js";

type AvatarRootNativeProps = NativeSpanProps<"children">;

export interface AvatarRootProps extends AvatarRootNativeProps {
  /** Image source URL. */
  src?: string;
  /** Callback when image loading status changes. */
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Content rendered inside the avatar. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AvatarRoot = forwardRef<HTMLSpanElement, AvatarRootProps>(
  function AvatarRoot(
    {
      src,
      onLoadingStatusChange,
      render,
      asChild,
      children,
      "data-slot": dataSlot = "avatar-root",
      ...rest
    },
    ref,
  ) {
    const status = useImageLoadingStatus(src, onLoadingStatusChange);

    const contextValue = useMemo<AvatarContextValue>(() => ({ status }), [status]);

    const behaviorProps: Record<string, unknown> = {
      ...rest,
      ref,
      "data-slot": dataSlot,
    };

    if (asChild) {
      const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;
      return cloneAndMerge(child, {
        ...behaviorProps,
        children: (
          <AvatarContext.Provider value={contextValue}>
            {child.props.children}
          </AvatarContext.Provider>
        ),
      });
    }

    return renderElement(render, "span", {
      ...behaviorProps,
      children: (
        <AvatarContext.Provider value={contextValue}>
          {children}
        </AvatarContext.Provider>
      ),
    });
  },
);
