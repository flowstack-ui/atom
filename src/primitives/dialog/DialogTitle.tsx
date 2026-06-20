"use client";

import { forwardRef } from "react";
import {
  ModalTitle,
  type ModalHeadingLevel,
  type ModalTitleProps,
} from "../modal/index.js";

export type DialogHeadingLevel = ModalHeadingLevel;
export interface DialogTitleProps extends ModalTitleProps {}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle(
    {
      "data-slot": dataSlot = "dialog-title",
      ...props
    },
    ref,
  ) {
    return (
      <ModalTitle
        {...props}
        ref={ref}
        data-slot={dataSlot}
      />
    );
  },
);
