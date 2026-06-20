"use client";

import { forwardRef } from "react";
import { ModalClose, type ModalCloseProps } from "../modal/index.js";

export interface DrawerCloseProps extends ModalCloseProps {}

export const DrawerClose = forwardRef<HTMLElement, DrawerCloseProps>(
  function DrawerClose(
    {
      "data-slot": dataSlot = "drawer-close",
      ...props
    },
    ref,
  ) {
    return (
      <ModalClose
        {...props}
        ref={ref}
        data-slot={dataSlot}
      />
    );
  },
);
