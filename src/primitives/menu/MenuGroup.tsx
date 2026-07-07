import type { ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";

type MenuGroupNativeProps = NativeDivProps<"children" | "role">;

export interface MenuGroupProps extends MenuGroupNativeProps {
  className?: string;
  children: ReactNode;
  "data-slot"?: string;
}

export function MenuGroup({ className, children, "data-slot": dataSlot = "menu-group", ...restProps }: MenuGroupProps) {
  return (
    <div
      {...restProps}
      role="group"
      data-slot={dataSlot}
      className={className}
    >
      {children}
    </div>
  );
}
