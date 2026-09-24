import {
  Children,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type Ref,
  cloneElement,
  isValidElement,
} from "react";
export { composeEventHandlers } from "./dom.js";

/** React 18 stores refs on the element; React 19 stores them in props. Avoid
 * either version's warning getter and preserve both caller and owner refs. */
function elementPropsWithRef(element: ReactElement): Record<string, unknown> {
  const props = element.props as Record<string, unknown>;
  const propRef = Object.getOwnPropertyDescriptor(props, "ref");
  const legacyRef = Object.getOwnPropertyDescriptor(element, "ref");
  const ref = propRef && "value" in propRef ? propRef.value
    : legacyRef && "value" in legacyRef ? legacyRef.value : undefined;
  return { ...props, ...(ref !== undefined ? { ref } : {}) };
}

/** Accepted values for the `render` prop. */
export type RenderProp =
  | string
  | ReactElement
  | ((props: Record<string, unknown>) => ReactElement);

export function mergeProps(
  originalProps: Record<string, unknown>,
  overrideProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...originalProps };

  for (const key of Object.keys(overrideProps)) {
    const originalValue = originalProps[key];
    const overrideValue = overrideProps[key];

    if (overrideValue === undefined) continue;

    if (
      key.startsWith("on") &&
      typeof originalValue === "function" &&
      typeof overrideValue === "function"
    ) {
      merged[key] = (...args: unknown[]) => {
        (overrideValue as (...a: unknown[]) => void)(...args);
        (originalValue as (...a: unknown[]) => void)(...args);
      };
      continue;
    }

    if (key === "className" && typeof originalValue === "string" && typeof overrideValue === "string") {
      merged[key] = `${originalValue} ${overrideValue}`;
      continue;
    }

    if (
      key === "style" &&
      originalValue !== null &&
      overrideValue !== null &&
      typeof originalValue === "object" &&
      typeof overrideValue === "object"
    ) {
      merged[key] = {
        ...(originalValue as Record<string, unknown>),
        ...(overrideValue as Record<string, unknown>),
      };
      continue;
    }

    if (key === "ref") {
      merged[key] = composeRefs(
        originalValue as Ref<unknown> | undefined,
        overrideValue as Ref<unknown> | undefined,
      );
      continue;
    }

    merged[key] = overrideValue;
  }

  return merged;
}

export function composeRefs(
  ...refs: (Ref<unknown> | undefined)[]
): (node: unknown) => void | (() => void) {
  return (node: unknown) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === "function") return ref(node);
      if (ref) (ref as { current: unknown }).current = node;
    });
    // React 18 uses the null callback path. React 19 may return cleanup.
    if (cleanups.some((cleanup) => typeof cleanup === "function")) {
      return () => refs.forEach((ref, index) => {
        const cleanup = cleanups[index];
        if (typeof cleanup === "function") cleanup();
        else if (typeof ref === "function") ref(null);
        else if (ref) (ref as { current: unknown }).current = null;
      });
    }
  };
}

export function renderElement(
  render: RenderProp | undefined,
  defaultTag: string,
  props: Record<string, unknown>,
): ReactElement {
  if (render === undefined) {
    const Tag = defaultTag as ElementType;
    return <Tag {...props} />;
  }

  if (typeof render === "string") {
    const Tag = render as ElementType;
    return <Tag {...props} />;
  }

  if (typeof render === "function") {
    return render(props);
  }

  if (isValidElement(render)) {
    return cloneElement(
      render,
      mergeProps(elementPropsWithRef(render), props),
    );
  }

  const Tag = defaultTag as ElementType;
  return <Tag {...props} />;
}

export function cloneAndMerge(
  children: ReactNode,
  props: Record<string, unknown>,
): ReactElement {
  const child = Children.only(children) as ReactElement;
  return cloneElement(
    child,
    mergeProps(elementPropsWithRef(child), props),
  );
}
