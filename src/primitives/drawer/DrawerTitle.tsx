"use client";

import { forwardRef } from "react";
import {
  ModalTitle,
  type ModalHeadingLevel,
  type ModalTitleProps,
} from "../modal/index.js";

export type DrawerHeadingLevel = ModalHeadingLevel;
export interface DrawerTitleProps extends ModalTitleProps {}

export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  function DrawerTitle(
    {
      "data-slot": dataSlot = "drawer-title",
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
