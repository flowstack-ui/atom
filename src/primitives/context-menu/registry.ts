import type { MenuCloseReason } from "../menu/context.js";

export interface ContextMenuTriggerRegistration {
  close: (reason: MenuCloseReason) => void;
  disabled: boolean;
  element: HTMLElement;
}

interface ContextMenuManager {
  active: ContextMenuTriggerRegistration | null;
  forwardedEvents: WeakSet<Event>;
  handleContextMenu: (event: MouseEvent) => void;
  ownerDocument: Document;
  registrations: Set<ContextMenuTriggerRegistration>;
}

const managersByDocument = new WeakMap<Document, ContextMenuManager>();

function containsPoint(element: HTMLElement, x: number, y: number): boolean {
  const ownerWindow = element.ownerDocument.defaultView;
  const firstChild = element.firstElementChild;
  const target = ownerWindow?.getComputedStyle(element).display === "contents"
    && firstChild instanceof ownerWindow.HTMLElement
    ? firstChild
    : element;
  const rect = target.getBoundingClientRect();
  return rect.width > 0
    && rect.height > 0
    && x >= rect.left
    && x <= rect.right
    && y >= rect.top
    && y <= rect.bottom;
}

function chooseRegistration(
  manager: ContextMenuManager,
  event: MouseEvent,
): ContextMenuTriggerRegistration | null {
  const ownerWindow = manager.ownerDocument.defaultView;
  if (!ownerWindow) return null;
  const eventTarget = event.target;
  const direct = Array.from(manager.registrations).find(({ disabled, element }) => (
    !disabled
    && eventTarget instanceof ownerWindow.Node
    && element.contains(eventTarget)
  ));
  if (direct) return direct;

  if (
    eventTarget instanceof ownerWindow.Element
    && eventTarget.closest("[role='menu']")
  ) {
    return null;
  }

  const matches = Array.from(manager.registrations).filter(({ disabled, element }) => (
    !disabled
    && element.isConnected
    && containsPoint(element, event.clientX, event.clientY)
  ));
  if (matches.length < 2) return matches[0] ?? null;

  return matches.reduce((selected, candidate) => {
    if (selected.element.contains(candidate.element)) return candidate;
    if (candidate.element.contains(selected.element)) return selected;
    return selected.element.compareDocumentPosition(candidate.element)
      & ownerWindow.Node.DOCUMENT_POSITION_FOLLOWING
      ? candidate
      : selected;
  });
}

function forwardContextMenu(
  manager: ContextMenuManager,
  registration: ContextMenuTriggerRegistration,
  event: MouseEvent,
): void {
  const ownerWindow = manager.ownerDocument.defaultView;
  if (!ownerWindow) return;
  const forwardedEvent = new ownerWindow.MouseEvent("contextmenu", {
    bubbles: true,
    button: event.button,
    buttons: event.buttons,
    cancelable: true,
    clientX: event.clientX,
    clientY: event.clientY,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    view: manager.ownerDocument.defaultView,
  });
  manager.forwardedEvents.add(forwardedEvent);
  registration.element.dispatchEvent(forwardedEvent);
}

function createManager(ownerDocument: Document): ContextMenuManager {
  const manager: ContextMenuManager = {
    active: null,
    forwardedEvents: new WeakSet<Event>(),
    handleContextMenu: () => undefined,
    ownerDocument,
    registrations: new Set<ContextMenuTriggerRegistration>(),
  };

  manager.handleContextMenu = (event) => {
    if (manager.forwardedEvents.has(event)) return;

    const registration = chooseRegistration(manager, event);
    if (!registration) {
      manager.active?.close("interactOutside");
      return;
    }

    event.preventDefault();
    if (manager.active && manager.active !== registration) {
      manager.active.close("interactOutside");
    }
    forwardContextMenu(manager, registration, event);
  };

  return manager;
}

function getManager(ownerDocument: Document): ContextMenuManager {
  let manager = managersByDocument.get(ownerDocument);
  if (!manager) {
    manager = createManager(ownerDocument);
    managersByDocument.set(ownerDocument, manager);
  }
  return manager;
}

export function registerContextMenuTrigger(
  registration: ContextMenuTriggerRegistration,
): () => void {
  const manager = getManager(registration.element.ownerDocument);
  manager.registrations.add(registration);
  return () => {
    manager.registrations.delete(registration);
    if (manager.active === registration) deactivateContextMenuTrigger(registration);
  };
}

export function activateContextMenuTrigger(
  registration: ContextMenuTriggerRegistration,
): () => void {
  const manager = getManager(registration.element.ownerDocument);
  if (!manager.active) {
    manager.ownerDocument.addEventListener(
      "contextmenu",
      manager.handleContextMenu,
      true,
    );
  }
  manager.active = registration;
  return () => deactivateContextMenuTrigger(registration);
}

function deactivateContextMenuTrigger(
  registration: ContextMenuTriggerRegistration,
): void {
  const manager = getManager(registration.element.ownerDocument);
  if (manager.active !== registration) return;
  manager.active = null;
  manager.ownerDocument.removeEventListener(
    "contextmenu",
    manager.handleContextMenu,
    true,
  );
}
