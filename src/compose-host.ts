import { Children, Fragment, cloneElement, type ReactElement, type ReactNode, type Ref } from "react";
import { mergeProps } from "./utils/slot.js";

/** Apply owner props to one existing host, preserving events and React 18/19 refs. */
export function composeHost(children: ReactNode, props: Record<string, unknown>): ReactElement {
  const child = Children.only(children) as ReactElement<Record<string, unknown>>;
  if (child.type === Fragment) throw new Error("composeHost requires one non-Fragment host.");
  // Reading descriptors avoids React 18 props.ref and React 19 element.ref warnings.
  const ref = (Object.getOwnPropertyDescriptor(child.props, "ref")?.value
    ?? Object.getOwnPropertyDescriptor(child, "ref")?.value) as Ref<unknown> | undefined;
  return cloneElement(child, mergeProps({ ...child.props, ref }, props));
}
