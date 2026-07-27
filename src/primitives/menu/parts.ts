import { Children, isValidElement, type ReactNode } from "react";

const MENU_LABEL_PART = Symbol.for("flowstack.atom.menu-label");
type MarkedPart = { [MENU_LABEL_PART]?: true };

export function markMenuLabelPart(component: object): void {
  (component as MarkedPart)[MENU_LABEL_PART] = true;
}

export function hasMenuLabelPart(children: ReactNode): boolean {
  let found = false;
  Children.forEach(children, (child) => {
    if (found || !isValidElement(child)) return;
    if ((child.type as MarkedPart)[MENU_LABEL_PART]) {
      found = true;
      return;
    }
    const nestedChildren = (child.props as { children?: ReactNode }).children;
    if (nestedChildren && hasMenuLabelPart(nestedChildren)) found = true;
  });
  return found;
}
