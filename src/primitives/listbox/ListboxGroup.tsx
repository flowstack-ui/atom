"use client";

import {
  forwardRef,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  ListboxGroupContextProvider,
  type ListboxGroupContextValue,
} from "./context.js";

type ListboxGroupNativeProps = NativeDivProps<"children" | "role" | "aria-labelledby">;

export interface ListboxGroupProps extends ListboxGroupNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ListboxGroup = forwardRef<HTMLElement, ListboxGroupProps>(
  function ListboxGroup(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "listbox-group",
      ...restProps
    },
    ref,
  ) {
    const [labelId, setLabelId] = useState<string | undefined>(undefined);
    const contextValue = useMemo<ListboxGroupContextValue>(
      () => ({ labelId, setLabelId }),
      [labelId],
    );
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "group",
      "aria-labelledby": labelId,
      "data-slot": dataSlot,
    };

    return (
      <ListboxGroupContextProvider value={contextValue}>
        {asChild
          ? cloneAndMerge(children, behaviorProps)
          : renderElement(render, "div", { ...behaviorProps, children })}
      </ListboxGroupContextProvider>
    );
  },
);
