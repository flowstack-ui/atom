"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useModalContext } from "./context.js";

type ModalBranchNativeProps = NativeDivProps<"children">;

export interface ModalBranchProps extends ModalBranchNativeProps {
  /** Consumer-owned portalled branch content. */
  children: ReactNode;
  /** Merge branch registration onto a single child element. */
  asChild?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ModalBranch = forwardRef<HTMLElement, ModalBranchProps>(
  function ModalBranch(
    {
      children,
      asChild = false,
      render,
      "data-slot": dataSlot = "modal-branch",
      ...restProps
    },
    ref,
  ) {
    const { registerBranch } = useModalContext();
    const unregisterRef = useRef<(() => void) | null>(null);
    const registrationRef = useCallback(
      (node: HTMLElement | null) => {
        unregisterRef.current?.();
        unregisterRef.current = node ? registerBranch(node) : null;
      },
      [registerBranch],
    );
    const composedRef = useMemo(
      () => composeRefs(registrationRef, ref),
      [registrationRef, ref],
    );
    const branchProps = {
      ...restProps,
      ref: composedRef,
      "data-slot": dataSlot,
    };

    if (asChild) return cloneAndMerge(children, branchProps);

    return renderElement(render, "div", {
      ...branchProps,
      children,
    });
  },
);
