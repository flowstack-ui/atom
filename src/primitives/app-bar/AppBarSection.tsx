import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type AppBarSectionNativeProps = NativeDivProps<"children">;

export interface AppBarSectionProps extends AppBarSectionNativeProps {
  /** Section content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge section props onto a single child. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

function createAppBarSection(slot: string, displayName: string) {
  const Component = forwardRef<HTMLDivElement, AppBarSectionProps>(
    function AppBarSection(
      {
        children,
        render,
        asChild,
        "data-slot": dataSlot = slot,
        ...restProps
      },
      ref,
    ) {
      const behaviorProps: Record<string, unknown> = {
        ...restProps,
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

  Component.displayName = displayName;
  return Component;
}

export const AppBarStart = createAppBarSection("appbar-start", "AppBar.Start");
export const AppBarCenter = createAppBarSection("appbar-center", "AppBar.Center");
export const AppBarEnd = createAppBarSection("appbar-end", "AppBar.End");
