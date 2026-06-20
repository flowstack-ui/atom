"use client";

import { MenuContent, type MenuContentProps } from "../menu/index.js";
import { useContextMenuContext } from "./context.js";

export type ContextMenuContentProps = Omit<MenuContentProps, "anchorPoint">;

export function ContextMenuContent(props: ContextMenuContentProps) {
  const { anchorPoint } = useContextMenuContext();

  return <MenuContent {...props} anchorPoint={anchorPoint} />;
}
