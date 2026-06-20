import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type AvatarGroupRootNativeProps = NativeDivProps<"children">;

export interface AvatarGroupRootProps extends AvatarGroupRootNativeProps {
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the group. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AvatarGroupRoot = forwardRef<HTMLDivElement, AvatarGroupRootProps>(
  function AvatarGroupRoot(
    {
      render,
      asChild,
      children,
      "data-slot": dataSlot = "avatar-group",
      ...rest
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...rest,
      ref,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", {
      ...behaviorProps,
      children,
    });
  },
);
