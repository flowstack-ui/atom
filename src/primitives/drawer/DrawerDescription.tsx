"use client";

import { forwardRef } from "react";
import {
  ModalDescription,
  type ModalDescriptionProps,
} from "../modal/index.js";
import { markModalPart } from "../modal/parts.js";

export interface DrawerDescriptionProps extends ModalDescriptionProps {}

export const DrawerDescription = forwardRef<
  HTMLParagraphElement,
  DrawerDescriptionProps
>(
  function DrawerDescription(
    {
      "data-slot": dataSlot = "drawer-description",
      ...props
    },
    ref,
  ) {
    return (
      <ModalDescription
        {...props}
        ref={ref}
        data-slot={dataSlot}
      />
    );
  },
);

markModalPart(DrawerDescription, "description");
