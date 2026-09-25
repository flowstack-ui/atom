"use client";

import { cloneElement, forwardRef, Fragment, useRef, type HTMLAttributes, type MouseEvent, type ReactElement } from "react";
import { cloneAndMerge } from "../../utils/slot.js";

export interface ActionDelegateProps {
  targetId: string;
  disabled?: boolean;
  children: ReactElement;
}
const interactive = 'a[href],button,input,select,textarea,label,summary,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="switch"],[role="combobox"],[role="menuitem"],[tabindex],[data-action-delegate-ignore]';
function unavailable(element: Element): boolean {
  return element.closest('[inert],[disabled],[aria-disabled="true"]') !== null;
}

/** Expands a real descendant control's pointer target without replacing semantics. */
export const ActionDelegate = forwardRef<HTMLElement, ActionDelegateProps>(function ActionDelegate(
  { targetId, disabled = false, children }, ref,
) {
  const cancelled = useRef(false);
  if (!children || children.type === Fragment) throw new TypeError("ActionDelegate requires one non-Fragment host.");
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled || cancelled.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const host = event.currentTarget;
    const doc = host.ownerDocument;
    const path = event.nativeEvent.composedPath();
    const hostIndex = path.indexOf(host);
    // React portals bubble through component ancestry, not DOM containment.
    if (hostIndex < 0 || unavailable(host) || doc.getSelection()?.toString()) return;
    for (const node of path.slice(0, hostIndex)) {
      if (node && typeof (node as Element).matches === "function") {
        const element = node as Element;
        if (element.matches(interactive) || element.hasAttribute("data-action-delegate-boundary")) return;
      }
    }
    const target = doc.getElementById(targetId);
    if (!target || target === host || !host.contains(target) || !target.matches('a[href],button,input[type="checkbox"]')) {
      if ((globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production") {
        console.warn("ActionDelegate target must be a real link, button or checkbox inside its host.");
      }
      return;
    }
    if (unavailable(target) || target.closest('[hidden]')) return;
    // Target click is naturally ignored by the interactive-path guard above.
    target.click();
  };
  const host = cloneAndMerge(children, {
    ref,
    "data-action-delegate": disabled ? undefined : "",
    "data-action-delegate-boundary": "",
    onPointerDown: () => { cancelled.current = false; },
    onPointerCancel: () => { cancelled.current = true; },
    onDragStart: () => { cancelled.current = true; },
  });
  // The host's consumer handler gets first refusal. Generic slot merging runs
  // overrides first, so compose this particular default action explicitly.
  return cloneElement(host, {
    onClick: (event: MouseEvent<HTMLElement>) => {
      (children.props as HTMLAttributes<HTMLElement>).onClick?.(event);
      handleClick(event);
    },
  } as HTMLAttributes<HTMLElement>);
});
