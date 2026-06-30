"use client";

import { forwardRef } from "react";
import { MenuContent, type MenuContentProps } from "../menu/index.js";
import { useContextMenuContext } from "./context.js";

export type ContextMenuContentProps = Omit<MenuContentProps, "anchorPoint">;

export const ContextMenuContent = forwardRef<
  HTMLDivElement,
  ContextMenuContentProps
>(function ContextMenuContent(props, ref) {
  const { anchorPoint } = useContextMenuContext();

  return <MenuContent {...props} anchorPoint={anchorPoint} ref={ref} />;
});
