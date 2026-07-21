"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

interface ScrollLockRegistration {
  allowRef?: RefObject<HTMLElement | null>;
  isAllowedTarget?: (target: Node) => boolean;
  active: boolean;
}

interface BodyStyleSnapshot {
  overflow: string;
  paddingRight: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
}

interface DocumentElementStyleSnapshot {
  overflow: string;
}

interface ScrollLockState {
  registrations: Set<ScrollLockRegistration>;
  bodyStyle: BodyStyleSnapshot | null;
  documentElementStyle: DocumentElementStyleSnapshot | null;
  lastTouch: { identifier: number; x: number; y: number } | null;
  wheelHandler: (event: WheelEvent) => void;
  touchStartHandler: (event: TouchEvent) => void;
  touchMoveHandler: (event: TouchEvent) => void;
  touchEndHandler: (event: TouchEvent) => void;
}

const statesByDocument = new WeakMap<Document, ScrollLockState>();

function getEventNode(target: EventTarget | null): Node | null {
  return target instanceof Node ? target : null;
}

function isAllowedTarget(state: ScrollLockState, target: Node): boolean {
  for (const registration of state.registrations) {
    if (!registration.active) continue;
    if (registration.allowRef?.current?.contains(target)) return true;
    if (registration.isAllowedTarget?.(target)) return true;
  }
  return false;
}

function canElementConsumeScroll(
  element: HTMLElement,
  deltaX: number,
  deltaY: number,
): boolean {
  const styles = getComputedStyle(element);
  const canScrollY = /(auto|scroll|overlay)/.test(styles.overflowY);
  const canScrollX = /(auto|scroll|overlay)/.test(styles.overflowX);

  if (deltaY !== 0 && canScrollY && element.scrollHeight > element.clientHeight) {
    if (deltaY < 0 && element.scrollTop > 0) return true;
    if (
      deltaY > 0 &&
      element.scrollTop + element.clientHeight < element.scrollHeight
    ) {
      return true;
    }
  }

  if (deltaX !== 0 && canScrollX && element.scrollWidth > element.clientWidth) {
    if (deltaX < 0 && element.scrollLeft > 0) return true;
    if (
      deltaX > 0 &&
      element.scrollLeft + element.clientWidth < element.scrollWidth
    ) {
      return true;
    }
  }

  return false;
}

function canAllowedRegionConsumeScroll(
  state: ScrollLockState,
  target: Node,
  deltaX: number,
  deltaY: number,
): boolean {
  if (deltaX === 0 && deltaY === 0) return true;

  let element = target instanceof HTMLElement
    ? target
    : target.parentElement;
  while (element && isAllowedTarget(state, element)) {
    if (canElementConsumeScroll(element, deltaX, deltaY)) return true;
    element = element.parentElement;
  }
  return false;
}

function preventBackgroundScroll(
  state: ScrollLockState,
  event: WheelEvent | TouchEvent,
  deltaX: number,
  deltaY: number,
): void {
  const target = getEventNode(event.target);
  if (
    target &&
    isAllowedTarget(state, target) &&
    canAllowedRegionConsumeScroll(state, target, deltaX, deltaY)
  ) {
    return;
  }
  event.preventDefault();
}

function getPrimaryTouch(event: TouchEvent): Touch | null {
  return event.touches.item(0) ?? event.changedTouches.item(0);
}

function createScrollLockState(): ScrollLockState {
  const state = {
    registrations: new Set<ScrollLockRegistration>(),
    bodyStyle: null,
    documentElementStyle: null,
    lastTouch: null,
  } as ScrollLockState;

  state.wheelHandler = (event) => {
    preventBackgroundScroll(state, event, event.deltaX, event.deltaY);
  };
  state.touchStartHandler = (event) => {
    const touch = getPrimaryTouch(event);
    state.lastTouch = touch
      ? { identifier: touch.identifier, x: touch.clientX, y: touch.clientY }
      : null;
  };
  state.touchMoveHandler = (event) => {
    const touch = getPrimaryTouch(event);
    const previous = state.lastTouch;
    if (!touch || !previous || touch.identifier !== previous.identifier) {
      event.preventDefault();
      return;
    }
    const deltaX = previous.x - touch.clientX;
    const deltaY = previous.y - touch.clientY;
    state.lastTouch = {
      identifier: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
    };
    preventBackgroundScroll(state, event, deltaX, deltaY);
  };
  state.touchEndHandler = () => {
    state.lastTouch = null;
  };
  return state;
}

function getScrollLockState(ownerDocument: Document): ScrollLockState {
  let state = statesByDocument.get(ownerDocument);
  if (!state) {
    state = createScrollLockState();
    statesByDocument.set(ownerDocument, state);
  }
  return state;
}

function lockDocument(ownerDocument: Document, state: ScrollLockState): void {
  const body = ownerDocument.body;
  const documentElement = ownerDocument.documentElement;
  const view = ownerDocument.defaultView;
  if (!view) return;

  state.bodyStyle = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  };
  state.documentElementStyle = {
    overflow: documentElement.style.overflow,
  };

  const unlockedClientWidth = documentElement.clientWidth;
  const currentPadding =
    Number.parseFloat(view.getComputedStyle(body).paddingRight) || 0;
  documentElement.style.overflow = "hidden";
  body.style.overflow = "hidden";
  const lockedClientWidth = documentElement.clientWidth;
  const releasedScrollbarWidth = unlockedClientWidth > 0
    ? Math.max(0, lockedClientWidth - unlockedClientWidth)
    : 0;
  if (releasedScrollbarWidth > 0) {
    body.style.paddingRight = `${currentPadding + releasedScrollbarWidth}px`;
  }

  ownerDocument.addEventListener("wheel", state.wheelHandler, { passive: false });
  ownerDocument.addEventListener("touchstart", state.touchStartHandler, { passive: true });
  ownerDocument.addEventListener("touchmove", state.touchMoveHandler, { passive: false });
  ownerDocument.addEventListener("touchend", state.touchEndHandler);
  ownerDocument.addEventListener("touchcancel", state.touchEndHandler);
}

function unlockDocument(ownerDocument: Document, state: ScrollLockState): void {
  const bodyStyle = state.bodyStyle;
  const documentElementStyle = state.documentElementStyle;
  if (!bodyStyle || !documentElementStyle) return;

  ownerDocument.removeEventListener("wheel", state.wheelHandler);
  ownerDocument.removeEventListener("touchstart", state.touchStartHandler);
  ownerDocument.removeEventListener("touchmove", state.touchMoveHandler);
  ownerDocument.removeEventListener("touchend", state.touchEndHandler);
  ownerDocument.removeEventListener("touchcancel", state.touchEndHandler);

  Object.assign(ownerDocument.documentElement.style, documentElementStyle);
  Object.assign(ownerDocument.body.style, bodyStyle);
  state.bodyStyle = null;
  state.documentElementStyle = null;
  state.lastTouch = null;
}

export function useScrollLock(
  enabled: boolean,
  allowRef?: RefObject<HTMLElement | null>,
  isAllowedTarget?: (target: Node) => boolean,
  active = true,
): void {
  const registrationRef = useRef<ScrollLockRegistration | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return undefined;
    const ownerDocument = allowRef?.current?.ownerDocument ?? document;
    const state = getScrollLockState(ownerDocument);
    const registration = { allowRef, isAllowedTarget, active };
    registrationRef.current = registration;

    if (state.registrations.size === 0) lockDocument(ownerDocument, state);
    state.registrations.add(registration);

    return () => {
      registrationRef.current = null;
      state.registrations.delete(registration);
      if (state.registrations.size === 0) unlockDocument(ownerDocument, state);
    };
  }, [allowRef, enabled, isAllowedTarget]);

  useLayoutEffect(() => {
    if (registrationRef.current) registrationRef.current.active = active;
  }, [active]);
}
