export interface ModalBranchMetadata {
  focusContainment: "owned" | "top-layer" | "excluded";
  tabParticipation: "modal-sequence" | "delegate" | "none";
  scrollParticipation: "allowed" | "blocked";
  isolation: "owned" | "background";
}

export const defaultModalBranchMetadata: ModalBranchMetadata = {
  focusContainment: "owned",
  tabParticipation: "delegate",
  scrollParticipation: "allowed",
  isolation: "owned",
};

export interface ModalLayer {
  parent: ModalLayer | null;
  active: boolean;
  activationOrder: number;
  ownerDocument: Document | null;
  content: HTMLElement | null;
  overlay: HTMLElement | null;
  branches: Map<HTMLElement, Map<symbol, ModalBranchMetadata>>;
  subscribers: Set<() => void>;
}

let activationOrder = 0;
const layersByDocument = new WeakMap<Document, Set<ModalLayer>>();

export function createModalLayer(parent: ModalLayer | null): ModalLayer {
  return {
    parent,
    active: false,
    activationOrder: 0,
    ownerDocument: null,
    content: null,
    overlay: null,
    branches: new Map(),
    subscribers: new Set(),
  };
}

function getDocumentLayers(ownerDocument: Document): Set<ModalLayer> {
  let layers = layersByDocument.get(ownerDocument);
  if (!layers) {
    layers = new Set();
    layersByDocument.set(ownerDocument, layers);
  }
  return layers;
}

function notifyDocument(ownerDocument: Document): void {
  for (const layer of getDocumentLayers(ownerDocument)) {
    for (const subscriber of layer.subscribers) subscriber();
  }
}

function notifyLayer(layer: ModalLayer): void {
  for (const subscriber of layer.subscribers) subscriber();
}

export function activateModalLayer(
  layer: ModalLayer,
  ownerDocument: Document,
): () => void {
  layer.active = true;
  layer.ownerDocument = ownerDocument;
  layer.activationOrder = ++activationOrder;
  getDocumentLayers(ownerDocument).add(layer);
  notifyDocument(ownerDocument);

  return () => {
    layer.active = false;
    getDocumentLayers(ownerDocument).delete(layer);
    notifyDocument(ownerDocument);
    layer.ownerDocument = null;
  };
}

function isAncestorLayer(ancestor: ModalLayer, descendant: ModalLayer): boolean {
  let current = descendant.parent;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}

export function getTopModalLayer(ownerDocument: Document): ModalLayer | null {
  let top: ModalLayer | null = null;
  for (const layer of getDocumentLayers(ownerDocument)) {
    if (!layer.active) continue;
    if (!top) {
      top = layer;
      continue;
    }
    if (isAncestorLayer(top, layer)) {
      top = layer;
      continue;
    }
    if (!isAncestorLayer(layer, top) && layer.activationOrder > top.activationOrder) {
      top = layer;
    }
  }
  return top;
}

export function isTopModalLayer(layer: ModalLayer): boolean {
  return Boolean(
    layer.active &&
    layer.ownerDocument &&
    getTopModalLayer(layer.ownerDocument) === layer,
  );
}

export function subscribeModalLayer(
  layer: ModalLayer,
  subscriber: () => void,
): () => void {
  layer.subscribers.add(subscriber);
  return () => layer.subscribers.delete(subscriber);
}

export function setModalLayerContent(
  layer: ModalLayer,
  content: HTMLElement | null,
): void {
  layer.content = content;
  notifyLayer(layer);
}

export function setModalLayerOverlay(
  layer: ModalLayer,
  overlay: HTMLElement | null,
): void {
  layer.overlay = overlay;
  notifyLayer(layer);
}

export function registerModalBranch(
  layer: ModalLayer,
  branch: HTMLElement,
  metadata: ModalBranchMetadata = defaultModalBranchMetadata,
): () => void {
  const registration = Symbol("modal-branch-registration");
  let registrations = layer.branches.get(branch);
  if (!registrations) {
    registrations = new Map();
    layer.branches.set(branch, registrations);
  }
  registrations.set(registration, metadata);
  notifyLayer(layer);
  return () => {
    const currentRegistrations = layer.branches.get(branch);
    if (!currentRegistrations?.delete(registration)) return;
    if (currentRegistrations.size === 0) layer.branches.delete(branch);
    notifyLayer(layer);
  };
}

function resolveBranchMetadata(
  registrations: Map<symbol, ModalBranchMetadata>,
): ModalBranchMetadata {
  const values = Array.from(registrations.values());
  return {
    focusContainment: values.some(
      ({ focusContainment }) => focusContainment === "owned",
    )
      ? "owned"
      : values.some(
            ({ focusContainment }) => focusContainment === "top-layer",
          )
        ? "top-layer"
        : "excluded",
    tabParticipation: values.some(
      ({ tabParticipation }) => tabParticipation === "none",
    )
      ? "none"
      : values.some(
            ({ tabParticipation }) => tabParticipation === "delegate",
          )
        ? "delegate"
        : "modal-sequence",
    scrollParticipation: values.some(
      ({ scrollParticipation }) => scrollParticipation === "blocked",
    )
      ? "blocked"
      : "allowed",
    isolation: values.some(({ isolation }) => isolation === "owned")
      ? "owned"
      : "background",
  };
}

export function getModalLayerBranches(
  layer: ModalLayer,
): Array<[HTMLElement, ModalBranchMetadata]> {
  return Array.from(layer.branches, ([branch, registrations]) => [
    branch,
    resolveBranchMetadata(registrations),
  ]);
}

export function isModalLayerScrollTarget(
  layer: ModalLayer,
  target: Node,
): boolean {
  if (layer.content?.contains(target)) return true;
  for (const [branch, metadata] of getModalLayerBranches(layer)) {
    if (
      metadata.scrollParticipation === "allowed" &&
      branch.contains(target)
    ) {
      return true;
    }
  }
  return false;
}
