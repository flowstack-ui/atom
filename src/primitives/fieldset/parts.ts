import {
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";

export type FieldsetPartKind = "legend" | "description" | "error";

const FIELDSET_PART = Symbol("@flowstack-ui/atom/fieldset-part");

type MarkedFieldsetPart = ComponentType<unknown> & {
  [FIELDSET_PART]?: FieldsetPartKind;
};

export interface FieldsetPartPresence {
  legend: boolean;
  description: boolean;
  error: boolean;
}

/** @internal Marks a semantic Fieldset part for deterministic server inspection. */
export function markFieldsetPart(component: object, kind: FieldsetPartKind): void {
  Object.defineProperty(component, FIELDSET_PART, {
    configurable: false,
    enumerable: false,
    value: kind,
  });
}

/** Inspects statically visible direct children, arrays, and fragments. */
export function getFieldsetPartPresence(
  children: ReactNode,
  invalid: boolean,
): FieldsetPartPresence {
  const presence: FieldsetPartPresence = {
    legend: false,
    description: false,
    error: false,
  };

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

    const kind = (node.type as MarkedFieldsetPart)[FIELDSET_PART];
    if (kind === "legend") presence.legend = true;
    if (kind === "description") presence.description = true;
    if (kind === "error") {
      const props = node.props as { forceMatch?: boolean };
      presence.error = Boolean(props.forceMatch || invalid);
    }
  }

  inspect(children);
  return presence;
}
