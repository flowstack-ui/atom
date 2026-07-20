import {
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";

export type FieldPartKind = "description" | "error";

const FIELD_PART = Symbol("@flowstack-ui/atom/field-part");

type MarkedFieldPart = ComponentType<unknown> & {
  [FIELD_PART]?: FieldPartKind;
};

export interface FieldPartPresence {
  description: boolean;
  error: boolean;
}

/**
 * Marks a public wrapper as a semantic Field part for deterministic server
 * inspection. Call once at module scope after creating a wrapper around the
 * matching Atom part.
 */
export function markFieldPart<T extends object>(
  component: T,
  kind: FieldPartKind,
): T {
  const existingKind = (component as MarkedFieldPart)[FIELD_PART];
  if (existingKind !== undefined) {
    if (existingKind !== kind) {
      throw new Error(
        `Field part is already marked as ${existingKind}; it cannot be marked as ${kind}.`,
      );
    }
    return component;
  }

  Object.defineProperty(component, FIELD_PART, {
    configurable: false,
    enumerable: false,
    value: kind,
  });
  return component;
}

/** Inspects statically visible direct children, arrays, and fragments. */
export function getFieldPartPresence(
  children: ReactNode,
  invalid: boolean,
): FieldPartPresence {
  const presence: FieldPartPresence = { description: false, error: false };

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

    const kind = (node.type as MarkedFieldPart)[FIELD_PART];
    if (kind === "description") presence.description = true;
    if (kind === "error") {
      const props = node.props as { forceMatch?: boolean; match?: boolean };
      presence.error = Boolean(
        props.forceMatch || (invalid && (props.match === undefined || props.match)),
      );
    }
  }

  inspect(children);
  return presence;
}
