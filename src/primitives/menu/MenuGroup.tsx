import type { ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";

type MenuGroupNativeProps = NativeDivProps<"children" | "role">;

export interface MenuGroupProps extends MenuGroupNativeProps {
  className?: string;
  children: ReactNode;
}

export function MenuGroup({ className, children, ...restProps }: MenuGroupProps) {
  return (
    <div
      {...restProps}
      role="group"
      data-slot="menu-group"
      className={className}
    >
      {children}
    </div>
  );
}
