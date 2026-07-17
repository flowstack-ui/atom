import type { FocusScope } from "../../hooks/focus.js";
import {
  getModalLayerBranches,
  getTopModalLayer,
  subscribeModalLayer,
  type ModalLayer,
} from "./layer.js";

interface InertSnapshot {
  attributeValue: string | null;
  propertyValue: boolean;
}

interface IsolationRecord {
  layer: ModalLayer;
  focusScope: FocusScope;
  unsubscribeLayer: () => void;
  unsubscribeFocusScope: () => void;
}

interface PendingInertWrite {
  oldValue: string | null;
}

interface IsolationManager {
  ownerDocument: Document;
  records: Map<ModalLayer, IsolationRecord>;
  managedInert: Map<Element, InertSnapshot>;
  pendingInertWrites: Map<Element, PendingInertWrite[]>;
  observer: MutationObserver | null;
  reconciling: boolean;
}

const managersByDocument = new WeakMap<Document, IsolationManager>();

function getManager(ownerDocument: Document): IsolationManager {
  let manager = managersByDocument.get(ownerDocument);
  if (!manager) {
    manager = {
      ownerDocument,
      records: new Map(),
      managedInert: new Map(),
      pendingInertWrites: new Map(),
      observer: null,
      reconciling: false,
    };
    managersByDocument.set(ownerDocument, manager);
  }
  return manager;
}

function readInertProperty(element: Element): boolean {
  return "inert" in element && (element as HTMLElement).inert;
}

function writeInertAttribute(
  manager: IsolationManager,
  element: Element,
  value: string | null,
): void {
  const currentValue = element.getAttribute("inert");
  if (currentValue === value) return;
  let pending = manager.pendingInertWrites.get(element);
  if (!pending) {
    pending = [];
    manager.pendingInertWrites.set(element, pending);
  }
  pending.push({ oldValue: currentValue });
  if (value === null) element.removeAttribute("inert");
  else element.setAttribute("inert", value);
}

function setManagedInert(manager: IsolationManager, element: Element): void {
  if (!manager.managedInert.has(element)) {
    manager.managedInert.set(element, {
      attributeValue: element.getAttribute("inert"),
      propertyValue: readInertProperty(element),
    });
  }
  if (!element.hasAttribute("inert")) {
    writeInertAttribute(manager, element, "");
  }
}

function restoreManagedInert(manager: IsolationManager, element: Element): void {
  const snapshot = manager.managedInert.get(element);
  if (!snapshot) return;

  writeInertAttribute(manager, element, snapshot.attributeValue);
  manager.managedInert.delete(element);
}

function restoreAll(manager: IsolationManager): void {
  for (const element of Array.from(manager.managedInert.keys())) {
    restoreManagedInert(manager, element);
  }
}

function getOwnedElements(record: IsolationRecord): Set<HTMLElement> {
  const { layer, focusScope } = record;
  const owned = new Set<HTMLElement>();
  if (layer.content) owned.add(layer.content);
  if (layer.overlay) owned.add(layer.overlay);
  for (const [branch, metadata] of getModalLayerBranches(layer)) {
    if (metadata.isolation === "owned") owned.add(branch);
  }
  for (const element of focusScope.getIsolationElements()) owned.add(element);
  return owned;
}

function reconcile(manager: IsolationManager): void {
  if (manager.reconciling) return;
  manager.reconciling = true;

  try {
    const body = manager.ownerDocument.body;
    const topLayer = getTopModalLayer(manager.ownerDocument);
    const record = topLayer ? manager.records.get(topLayer) : undefined;
    if (!record) {
      restoreAll(manager);
      return;
    }

    const owned = getOwnedElements(record);
    for (const element of Array.from(owned)) {
      if (
        !element.isConnected ||
        element.ownerDocument !== manager.ownerDocument ||
        !body.contains(element)
      ) {
        owned.delete(element);
      }
    }
    if (owned.size === 0) {
      restoreAll(manager);
      return;
    }

    const preservedPaths = new Set<Element>([body]);
    for (const element of owned) {
      let current: Element | null = element;
      while (current) {
        preservedPaths.add(current);
        if (current === body) break;
        current = current.parentElement;
      }
    }

    const desiredInert = new Set<Element>();
    const visit = (parent: Element) => {
      for (const child of Array.from(parent.children)) {
        if (owned.has(child as HTMLElement)) continue;
        if (preservedPaths.has(child)) {
          visit(child);
        } else {
          desiredInert.add(child);
        }
      }
    };
    visit(body);

    for (const element of Array.from(manager.managedInert.keys())) {
      if (!desiredInert.has(element)) restoreManagedInert(manager, element);
    }
    for (const element of desiredInert) setManagedInert(manager, element);
  } finally {
    manager.reconciling = false;
  }
}

function ensureObserver(manager: IsolationManager): void {
  if (manager.observer) return;
  manager.observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "attributes") continue;
      const element = mutation.target as Element;
      const pending = manager.pendingInertWrites.get(element);
      if (pending?.[0]?.oldValue === mutation.oldValue) {
        pending.shift();
        if (pending.length === 0) manager.pendingInertWrites.delete(element);
        continue;
      }

      const snapshot = manager.managedInert.get(element);
      if (!snapshot) continue;
      snapshot.attributeValue = element.getAttribute("inert");
      snapshot.propertyValue = readInertProperty(element);
      if (!element.hasAttribute("inert")) {
        writeInertAttribute(manager, element, "");
      }
    }
    reconcile(manager);
  });
  manager.observer.observe(manager.ownerDocument.body, {
    attributes: true,
    attributeFilter: ["inert"],
    attributeOldValue: true,
    childList: true,
    subtree: true,
  });
}

export function registerModalIsolation(
  layer: ModalLayer,
  focusScope: FocusScope,
  ownerDocument: Document,
): () => void {
  const manager = getManager(ownerDocument);
  const update = () => reconcile(manager);
  const record: IsolationRecord = {
    layer,
    focusScope,
    unsubscribeLayer: subscribeModalLayer(layer, update),
    unsubscribeFocusScope: focusScope.subscribe(update),
  };
  manager.records.set(layer, record);
  ensureObserver(manager);
  reconcile(manager);

  return () => {
    record.unsubscribeLayer();
    record.unsubscribeFocusScope();
    manager.records.delete(layer);
    if (manager.records.size === 0) {
      manager.observer?.disconnect();
      manager.observer = null;
      restoreAll(manager);
      manager.pendingInertWrites.clear();
      return;
    }
    reconcile(manager);
  };
}
