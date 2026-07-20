"use client";

import { forwardRef, useCallback, useMemo, useRef, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { usePopoverContext } from "./context.js";
import { markPopoverPart } from "./parts.js";

type PopoverDescriptionNativeProps = NativeParagraphProps<"children">;

export interface PopoverDescriptionProps extends PopoverDescriptionNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const PopoverDescription = forwardRef<
  HTMLParagraphElement,
  PopoverDescriptionProps
>(function PopoverDescription(
  {
    children,
    className,
    "data-slot": dataSlot = "popover-description",
    ...restProps
  },
  ref,
) {
  const { descriptionId, registerPart } = usePopoverContext();
  const unregisterRef = useRef<(() => void) | null>(null);
  const registrationRef = useCallback(
    (node: HTMLParagraphElement | null) => {
      unregisterRef.current?.();
      unregisterRef.current = node ? registerPart("description") : null;
    },
    [registerPart],
  );
  const composedRef = useMemo(
    () => composeRefs(registrationRef, ref),
    [registrationRef, ref],
  );

  return (
    <p
      {...restProps}
      ref={composedRef}
      id={descriptionId}
      data-slot={dataSlot}
      className={className}
    >
      {children}
    </p>
  );
});

markPopoverPart(PopoverDescription, "description");
