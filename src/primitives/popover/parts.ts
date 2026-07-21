import {
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";

export type PopoverPartKind = "title" | "description";
type MarkedPopoverPartKind = PopoverPartKind | "arrow";

const POPOVER_PART = Symbol("@flowstack-ui/atom/popover-part");

type MarkedPopoverPart = ComponentType<unknown> & {
  [POPOVER_PART]?: MarkedPopoverPartKind;
};

export interface PopoverPartPresence {
  title: boolean;
  description: boolean;
}

export function isPopoverPart(node: ReactNode, kind: MarkedPopoverPartKind): boolean {
  return isValidElement(node) &&
    (node.type as MarkedPopoverPart)[POPOVER_PART] === kind;
}

/** @internal Marks a semantic Popover part for deterministic server inspection. */
export function markPopoverPart(
  component: object,
  kind: MarkedPopoverPartKind,
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
    if (kind === "title" || kind === "description") presence[kind] = true;
  }

  inspect(children);
  return presence;
}
