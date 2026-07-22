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
  errorPresenter: boolean;
}

/**
 * Marks a public wrapper as a semantic Fieldset part for deterministic server
 * inspection. Call once at module scope after creating a wrapper around the
 * matching Atom part.
 */
export function markFieldsetPart<T extends object>(
  component: T,
  kind: FieldsetPartKind,
): T {
  const existingKind = (component as MarkedFieldsetPart)[FIELDSET_PART];
  if (existingKind !== undefined) {
    if (existingKind !== kind) {
      throw new Error(
        `Fieldset part is already marked as ${existingKind}; it cannot be marked as ${kind}.`,
      );
    }
    return component;
  }

  Object.defineProperty(component, FIELDSET_PART, {
    configurable: false,
    enumerable: false,
    value: kind,
  });
  return component;
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
    errorPresenter: false,
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
      presence.errorPresenter = true;
      presence.error = Boolean(props.forceMatch || invalid);
    }
  }

  inspect(children);
  return presence;
}
