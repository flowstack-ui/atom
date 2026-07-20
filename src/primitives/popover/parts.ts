import {
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";

export type PopoverPartKind = "title" | "description";

const POPOVER_PART = Symbol("@flowstack-ui/atom/popover-part");

type MarkedPopoverPart = ComponentType<unknown> & {
  [POPOVER_PART]?: PopoverPartKind;
};

export interface PopoverPartPresence {
  title: boolean;
  description: boolean;
}

/** @internal Marks a semantic Popover part for deterministic server inspection. */
export function markPopoverPart(
  component: object,
  kind: PopoverPartKind,
): void {
  Object.defineProperty(component, POPOVER_PART, {
    configurable: false,
    enumerable: false,
    value: kind,
  });
}

/** Inspects statically visible direct children, arrays, and fragments. */
export function getPopoverPartPresence(
  children: ReactNode,
): PopoverPartPresence {
  const presence: PopoverPartPresence = { title: false, description: false };

  function inspect(node: ReactNode): void {
    if (Array.isArray(node)) {
      node.forEach(inspect);
      return;
    }

    if (!isValidElement(node)) return;

    if (node.type === Fragment) {
      inspect((node.props as { children?: ReactNode }).children);
      return;
    }

    const kind = (node.type as MarkedPopoverPart)[POPOVER_PART];
    if (kind) presence[kind] = true;
  }

  inspect(children);
  return presence;
}
