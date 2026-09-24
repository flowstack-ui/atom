"use client";

import { useCallback, useEffect, useRef, type RefObject, type KeyboardEvent } from "react";
import { FOCUSABLE_SELECTOR } from "../hooks/focus.js";

const selector = `${FOCUSABLE_SELECTOR}, [tabindex="-1"], [contenteditable="true"]`;
const ownedControls = (element: HTMLElement) => [...element.querySelectorAll<HTMLElement>(selector)]
  .filter(node => node.closest('[role="treeitem"], [role="gridcell"], [role="rowheader"], [role="columnheader"]') === element);

/** Manages opt-in controls inside an active-descendant composite item. */
export function useCompositeInteraction(
  ref: RefObject<HTMLElement | null>, enabled: boolean, disabled: boolean,
  onEnter: () => void, onReturn: () => void,
) {
  const callbacks = useRef({ onEnter, onReturn });
  callbacks.current = { onEnter, onReturn };
  const tabs = useRef(new Map<HTMLElement, string | null>());
  const enterInteraction = useCallback(() => {
    const element = ref.current;
    if (!enabled || disabled || !element) return false;
    const nodes = ownedControls(element).filter(node =>
      !node.matches(':disabled, [aria-disabled="true"]') && !node.closest('[hidden], [inert]') && node.getClientRects().length > 0);
    if (!nodes[0]) return false;
    for (const node of nodes) {
      const original = tabs.current.get(node);
      if (original === null) node.removeAttribute('tabindex');
      else node.setAttribute('tabindex', original ?? '0');
    }
    nodes[0].focus({ preventScroll: true });
    return element.contains(element.ownerDocument.activeElement);
  }, [ref, enabled, disabled]);
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const originalTabs = tabs.current;
    const sync = () => {
      const interacting = element.contains(element.ownerDocument.activeElement);
      for (const node of ownedControls(element)) {
        if (!originalTabs.has(node)) originalTabs.set(node, node.getAttribute('tabindex'));
        if (!interacting || disabled) node.tabIndex = -1;
      }
    };
    const focusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (disabled || target.closest('[role="treeitem"], [role="gridcell"], [role="rowheader"], [role="columnheader"]') !== element) return;
      for (const node of ownedControls(element)) {
        if (node.matches(':disabled, [aria-disabled="true"]')) continue;
        const original = originalTabs.get(node);
        if (original === null) node.removeAttribute('tabindex');
        else if (original !== undefined) node.setAttribute('tabindex', original);
      }
      callbacks.current.onEnter();
    };
    const focusOut = (event: FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !element.contains(event.relatedTarget)) {
        for (const node of originalTabs.keys()) node.tabIndex = -1;
      }
    };
    sync();
    const Observer = element.ownerDocument.defaultView?.MutationObserver;
    const observer = Observer ? new Observer(sync) : undefined;
    observer?.observe(element, { childList: true, subtree: true });
    element.addEventListener('focusin', focusIn);
    element.addEventListener('focusout', focusOut);
    return () => {
      observer?.disconnect();
      element.removeEventListener('focusin', focusIn);
      element.removeEventListener('focusout', focusOut);
      for (const [node, original] of originalTabs) {
        if (original === null) node.removeAttribute('tabindex');
        else node.setAttribute('tabindex', original);
      }
      originalTabs.clear();
    };
  }, [ref, enabled, disabled]);
  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (!enabled || disabled || event.defaultPrevented || event.key !== 'Escape' || event.target === event.currentTarget) return;
    const target = event.target as Element;
    if (target.closest('[role="tree"], [role="treegrid"], [role="grid"]') !== event.currentTarget.closest('[role="tree"], [role="treegrid"], [role="grid"]')) return;
    event.preventDefault();
    event.stopPropagation();
    callbacks.current.onReturn();
    for (const node of tabs.current.keys()) node.tabIndex = -1;
  }, [enabled, disabled]);
  return { enterInteraction, onKeyDown };
}
