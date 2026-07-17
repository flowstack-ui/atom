import {
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";

export type ModalPartKind = "title" | "description";

const MODAL_PART = Symbol("@flowstack-ui/atom/modal-part");

type MarkedModalPart = ComponentType<unknown> & {
  [MODAL_PART]?: ModalPartKind;
};

export interface ModalPartPresence {
  title: boolean;
  description: boolean;
}

/** @internal Marks a Modal-family alias for deterministic server inspection. */
export function markModalPart(
  component: object,
  kind: ModalPartKind,
): void {
  Object.defineProperty(component, MODAL_PART, {
    configurable: false,
    enumerable: false,
    value: kind,
  });
}

/**
 * Inspects only statically visible direct children, arrays, and fragments.
 * Arbitrary wrapper components are deliberately not executed or traversed.
 */
export function getModalPartPresence(children: ReactNode): ModalPartPresence {
  const presence: ModalPartPresence = { title: false, description: false };

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

    const kind = (node.type as MarkedModalPart)[MODAL_PART];
    if (kind) presence[kind] = true;
  }

  inspect(children);
  return presence;
}
