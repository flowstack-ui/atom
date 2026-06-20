"use client";

import { useCallback, useState, type ReactNode } from "react";
import { MenuRoot } from "../menu/index.js";
import {
  ContextMenuContextProvider,
  type ContextMenuAnchorPoint,
} from "./context.js";

export interface ContextMenuRootProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  closeOnSelect?: boolean;
  loop?: boolean;
  closeOnEscape?: boolean;
}

export function ContextMenuRoot({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  closeOnSelect = true,
  loop = true,
  closeOnEscape = true,
}: ContextMenuRootProps) {
  const [anchorPoint, setAnchorPointState] = useState<ContextMenuAnchorPoint | null>(null);

  const setAnchorPoint = useCallback((point: ContextMenuAnchorPoint | null) => {
    setAnchorPointState(point);
  }, []);

  return (
    <MenuRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
      closeOnSelect={closeOnSelect}
      loop={loop}
      closeOnEscape={closeOnEscape}
    >
      <ContextMenuContextProvider value={{ anchorPoint, setAnchorPoint }}>
        {children}
      </ContextMenuContextProvider>
    </MenuRoot>
  );
}
