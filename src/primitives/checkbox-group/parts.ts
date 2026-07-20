import {
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";
import type { CheckboxGroupItemPartKind } from "./context.js";

const CHECKBOX_GROUP_ITEM_PART = Symbol(
  "@flowstack-ui/atom/checkbox-group-item-part",
);

type MarkedCheckboxGroupItemPart = ComponentType<unknown> & {
  [CHECKBOX_GROUP_ITEM_PART]?: CheckboxGroupItemPartKind;
};

export interface CheckboxGroupItemPartPresence {
  label: boolean;
  description: boolean;
}

/** Marks a styled wrapper as a semantic CheckboxGroup Item part. */
export function markCheckboxGroupItemPart<T extends object>(
  component: T,
  kind: CheckboxGroupItemPartKind,
): T {
  const existingKind = (component as MarkedCheckboxGroupItemPart)[
    CHECKBOX_GROUP_ITEM_PART
  ];
  if (existingKind !== undefined) {
    if (existingKind !== kind) {
      throw new Error(
        `CheckboxGroup item part is already marked as ${existingKind}; it cannot be marked as ${kind}.`,
      );
    }
    return component;
  }

  Object.defineProperty(component, CHECKBOX_GROUP_ITEM_PART, {
    configurable: false,
    enumerable: false,
    value: kind,
  });
  return component;
}

/** Inspects statically visible direct children, arrays, and fragments. */
export function getCheckboxGroupItemPartPresence(
  children: ReactNode,
): CheckboxGroupItemPartPresence {
  const presence = { label: false, description: false };

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

    const kind = (node.type as MarkedCheckboxGroupItemPart)[
      CHECKBOX_GROUP_ITEM_PART
    ];
    if (kind === "label") presence.label = true;
    if (kind === "description") presence.description = true;
  }

  inspect(children);
  return presence;
}
