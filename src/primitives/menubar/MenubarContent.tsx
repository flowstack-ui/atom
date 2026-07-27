"use client";

import {
  forwardRef,
  useCallback,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import {
  MenuContent,
  useMenuContext,
  type MenuAlign,
  type MenuSide,
} from "../menu/index.js";
import type { NativeDivProps } from "../../utils/dom.js";
import type { RenderProp } from "../../utils/slot.js";
import { useMenubarContext, useMenubarMenuContext } from "./context.js";

type MenubarContentNativeProps = NativeDivProps<"children" | "role">;

export interface MenubarContentProps extends MenubarContentNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  side?: MenuSide;
  align?: MenuAlign;
  sideOffset?: number;
  loop?: boolean;
  ariaLabel?: string;
  className?: string;
  onKeyDownCapture?: KeyboardEventHandler<HTMLDivElement>;
  "data-slot"?: string;
}

export const MenubarContent = forwardRef<HTMLDivElement, MenubarContentProps>(
function MenubarContent(
  {
    children,
    asChild = false,
    render,
    side = "bottom",
    align = "start",
    sideOffset = 4,
    loop,
    ariaLabel,
    className,
    onKeyDownCapture,
    "data-slot": dataSlot,
    ...restProps
  },
  ref,
) {
  const barCtx = useMenubarContext();
  const { menuValue } = useMenubarMenuContext();
  const menuCtx = useMenuContext();
  const { dir, openAdjacentMenu } = barCtx;
  const { getItemElement, highlightedValue } = menuCtx;

  const handleKeyDownCapture = useCallback(
    (event: KeyboardEvent) => {
      onKeyDownCapture?.(event as KeyboardEvent<HTMLDivElement>);
      if (event.defaultPrevented) return;

      const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const previousKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";

      if (event.key === previousKey) {
        event.preventDefault();
        openAdjacentMenu(menuValue, "prev");
      } else if (event.key === nextKey) {
        const highlightedElement = highlightedValue
          ? getItemElement(highlightedValue)
          : undefined;

        if (highlightedElement?.dataset.slot === "menu-sub-trigger") {
          return;
        }

        event.preventDefault();
        openAdjacentMenu(menuValue, "next");
      }
    },
    [dir, getItemElement, highlightedValue, menuValue, onKeyDownCapture, openAdjacentMenu],
  );

  return (
    <MenuContent
      {...restProps}
      ref={ref}
      side={side}
      align={align}
      sideOffset={sideOffset}
      loop={loop}
      ariaLabel={ariaLabel}
      className={className}
      asChild={asChild}
      render={render}
      data-slot={dataSlot}
      onKeyDownCapture={handleKeyDownCapture}
    >
      {children}
    </MenuContent>
  );
});
