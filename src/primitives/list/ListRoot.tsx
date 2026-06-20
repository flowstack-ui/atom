import { forwardRef, type ReactNode } from "react";
import type { NativeListProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type ListRootNativeProps = NativeListProps<"children">;

export interface ListRootProps extends ListRootNativeProps {
  /** List items. Use `List.Item` for native list item semantics. */
  children?: ReactNode;
  /** Render as an ordered list (`ol`) instead of an unordered list (`ul`). */
  ordered?: boolean;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge list props onto a single child. The child should render a list-compatible element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ListRoot = forwardRef<HTMLUListElement | HTMLOListElement, ListRootProps>(
  function ListRoot(
    {
      children,
      ordered = false,
      render,
      asChild,
      "data-slot": dataSlot = "list",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      ...(ordered && { "data-ordered": "" }),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, ordered ? "ol" : "ul", {
      ...behaviorProps,
      children,
    });
  },
);
