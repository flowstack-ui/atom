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

/** @internal Marks a semantic Field part for deterministic server inspection. */
export function markFieldPart(component: object, kind: FieldPartKind): void {
  Object.defineProperty(component, FIELD_PART, {
    configurable: false,
    enumerable: false,
    value: kind,
  });
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
