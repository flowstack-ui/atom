import type { NativeDivProps } from "../../utils/dom.js";

type MenuSeparatorNativeProps = NativeDivProps<"children" | "role">;

export interface MenuSeparatorProps extends MenuSeparatorNativeProps {
  className?: string;
}

export function MenuSeparator({ className, ...restProps }: MenuSeparatorProps) {
  return (
    <div
      {...restProps}
      role="separator"
      aria-orientation="horizontal"
      data-slot="menu-separator"
      className={className}
    />
  );
}
