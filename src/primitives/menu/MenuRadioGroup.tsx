"use client";

import { forwardRef, useCallback, useId, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { MenuRadioGroupContextProvider } from "./context.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { hasMenuLabelPart } from "./parts.js";

type MenuRadioGroupNativeProps = NativeDivProps<"children" | "role">;

export interface MenuRadioGroupProps extends MenuRadioGroupNativeProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
  "data-slot"?: string;
  asChild?: boolean;
  render?: RenderProp;
}

export const MenuRadioGroup = forwardRef<HTMLElement, MenuRadioGroupProps>(function MenuRadioGroup({
  value,
  onValueChange,
  className,
  children,
  asChild = false,
  render,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "data-slot": dataSlot = "menu-radio-group",
  ...restProps
}: MenuRadioGroupProps, ref) {
  const groupId = useId();
  const labelId = useId();
  const hasLabel = hasMenuLabelPart(children);
  const handleValueChange = useCallback(
    (newValue: string) => onValueChange?.(newValue),
    [onValueChange],
  );

  return (
    <MenuRadioGroupContextProvider
      value={{ groupId, labelId, value, onValueChange: handleValueChange }}
    >
      {asChild
        ? cloneAndMerge(children, { ...restProps, ref, role: "group", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy ?? (ariaLabel || !hasLabel ? undefined : labelId), "data-slot": dataSlot, className })
        : renderElement(render, "div", { ...restProps, ref, role: "group", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy ?? (ariaLabel || !hasLabel ? undefined : labelId), "data-slot": dataSlot, className, children })}
    </MenuRadioGroupContextProvider>
  );
});
