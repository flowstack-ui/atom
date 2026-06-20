"use client";

import { forwardRef } from "react";
import { ModalClose, type ModalCloseProps } from "../modal/index.js";

export interface DialogCloseProps extends ModalCloseProps {}

export const DialogClose = forwardRef<HTMLElement, DialogCloseProps>(
  function DialogClose(
    {
      "data-slot": dataSlot = "dialog-close",
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
