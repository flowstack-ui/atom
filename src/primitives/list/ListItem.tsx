import { forwardRef, type ReactNode } from "react";
import type { NativeListItemProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type ListItemNativeProps = NativeListItemProps<"children">;

export interface ListItemProps extends ListItemNativeProps {
  /** List item content. */
  children?: ReactNode;
  /** Mark the list item as disabled for styling hooks only. */
  disabled?: boolean;
  /** Override the rendered item element. */
  render?: RenderProp;
  /** Merge item props onto a single child. The child should render an `li`-compatible element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem(
    {
      children,
      disabled = false,
      render,
      asChild,
      "data-slot": dataSlot = "list-item",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      ...(disabled && { "aria-disabled": true, "data-disabled": "" }),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "li", {
      ...behaviorProps,
      children,
    });
  },
);
