import type { NativeDivProps } from "../../utils/dom.js";

type MenuSeparatorNativeProps = NativeDivProps<"children" | "role">;

export interface MenuSeparatorProps extends MenuSeparatorNativeProps {
  className?: string;
  "data-slot"?: string;
}

export function MenuSeparator({ className, "data-slot": dataSlot = "menu-separator", ...restProps }: MenuSeparatorProps) {
  return (
    <div
      {...restProps}
      role="separator"
      aria-orientation="horizontal"
      data-slot={dataSlot}
      className={className}
    />
  );
}
