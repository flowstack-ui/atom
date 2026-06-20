"use client";

import {
  forwardRef,
  useEffect,
  useId,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useListboxGroupContext } from "./context.js";

type ListboxLabelNativeProps = NativeDivProps<"children" | "id">;

export interface ListboxLabelProps extends ListboxLabelNativeProps {
  children?: ReactNode;
  id?: string;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ListboxLabel = forwardRef<HTMLElement, ListboxLabelProps>(
  function ListboxLabel(
    {
      children,
      render,
      asChild,
      id,
      "data-slot": dataSlot = "listbox-label",
      ...restProps
    },
    ref,
  ) {
    const groupCtx = useListboxGroupContext();
    const generatedId = useId();
    const labelId = id ?? `listbox-label-${generatedId}`;
    const setGroupLabelId = groupCtx?.setLabelId;

    useEffect(() => {
      setGroupLabelId?.(labelId);
      return () => setGroupLabelId?.(undefined);
    }, [labelId, setGroupLabelId]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: labelId,
      "data-slot": dataSlot,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
