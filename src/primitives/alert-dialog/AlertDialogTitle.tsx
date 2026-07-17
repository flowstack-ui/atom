"use client";

import { forwardRef } from "react";
import {
  ModalTitle,
  type ModalHeadingLevel,
  type ModalTitleProps,
} from "../modal/index.js";
import { markModalPart } from "../modal/parts.js";

export type AlertDialogHeadingLevel = ModalHeadingLevel;
export interface AlertDialogTitleProps extends ModalTitleProps {}

export const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  function AlertDialogTitle(
    {
      "data-slot": dataSlot = "alert-dialog-title",
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

markModalPart(AlertDialogTitle, "title");
