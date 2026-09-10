"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCreateOverlayScope, type OverlayScope } from "./overlayScope.js";

type Layer = { onEscape: (event: KeyboardEvent) => void; scope: OverlayScope; elements: HTMLElement[]; order: number };
type Registry = { layers: Layer[]; listener: (event: KeyboardEvent) => void };
const registries = new WeakMap<Document, Registry>();
let activation = 0;
function modalOrder(scope: OverlayScope | null): number {
  return scope ? Math.max(scope.modal ? scope.activation : 0, modalOrder(scope.parent)) : 0;
}
function ancestor(parent: OverlayScope, child: OverlayScope | null): boolean {
  return child ? child.parent === parent || ancestor(parent, child.parent) : false;
}
function synchronize(registry: Registry) {
  registry.layers.sort((a,b) => modalOrder(a.scope) - modalOrder(b.scope) || (ancestor(a.scope,b.scope) ? -1 : ancestor(b.scope,a.scope) ? 1 : a.order-b.order));
  registry.layers.forEach((layer,index) => new Set([...layer.elements,...layer.scope.hosts]).forEach(node => {
    const value = String(index * 2);
    if (node.style.getPropertyValue("--atom-overlay-layer") !== value) node.style.setProperty("--atom-overlay-layer", value);
  }));
}

export interface UseDismissableLayerOptions {
  /** Whether this layer participates in dismissal. */
  enabled: boolean;
  /** Rendering document. Defaults to current document for existing callers. */
  ownerDocument?: Document | null;
  /** @internal React ownership scope, including portalled descendants. */
  scope?: OverlayScope | null;
  /** @internal Owned layer hosts receive a runtime stacking index. */
  elements?: readonly (HTMLElement | null | undefined)[];
  /** @internal Resolve a late-mounted host without reading the DOM in render. */
  getElements?: (document: Document) => readonly (HTMLElement | null | undefined)[];
  /** Called only for the topmost enabled layer when Escape is pressed. */
  onEscapeKeyDown: (event: KeyboardEvent) => void;
}

export function useDismissableLayer({ enabled, ownerDocument, onEscapeKeyDown, scope: suppliedScope, elements = [], getElements }: UseDismissableLayerOptions): () => void {
  const implicitScope = useCreateOverlayScope();
  const scope = suppliedScope ?? implicitScope;
  const hosts = useRef(elements); hosts.current = elements;
  const resolveHosts = useRef(getElements); resolveHosts.current = getElements;
  const callback = useRef(onEscapeKeyDown);
  callback.current = onEscapeKeyDown;
  const active = useRef<{ registry: Registry; layer: Layer } | null>(null);
  const doc = ownerDocument ?? (typeof document === "undefined" ? null : document);
  useEffect(() => {
    if (!enabled || !doc) return;
    let registry = registries.get(doc);
    if (!registry) {
      const layers: Layer[] = [];
      registry = { layers, listener(event) {
        if (event.key !== "Escape" || event.defaultPrevented) return;
        layers[layers.length - 1]?.onEscape(event);
      } };
      registries.set(doc, registry);
      doc.addEventListener("keydown", registry.listener, true);
    }
    scope.activation = ++activation;
    const layer: Layer = { onEscape: event => callback.current(event), scope, elements: (resolveHosts.current?.(doc) ?? hosts.current).filter((node): node is HTMLElement => Boolean(node)), order: activation };
    registry.layers.push(layer);
    scope.refresh = () => synchronize(registry);
    synchronize(registry);
    active.current = { registry, layer };
    return () => {
      const index = registry.layers.indexOf(layer);
      if (index >= 0) registry.layers.splice(index, 1);
      new Set([...layer.elements,...scope.hosts]).forEach(node => node.style.removeProperty("--atom-overlay-layer"));
      scope.refresh = undefined;
      scope.activation = 0;
      synchronize(registry);
      if (!registry.layers.length) {
        doc.removeEventListener("keydown", registry.listener, true);
        registries.delete(doc);
      }
      active.current = null;
    };
  }, [enabled, doc, scope]);
  useEffect(() => {
    const entry = active.current;
    if (!entry) return;
    const nextHosts = (doc && resolveHosts.current?.(doc) || hosts.current).filter((node): node is HTMLElement => Boolean(node));
    entry.layer.elements.filter(node => !nextHosts.includes(node)).forEach(node => node.style.removeProperty("--atom-overlay-layer"));
    entry.layer.elements = nextHosts;
    synchronize(entry.registry);
  });
  return useCallback(() => {
    const entry = active.current;
    if (!entry) return;
    const { layers } = entry.registry;
    const index = layers.indexOf(entry.layer);
    if (index < 0 || index === layers.length - 1) return;
    layers.splice(index, 1);
    layers.push(entry.layer);
    entry.layer.order = ++activation;
    synchronize(entry.registry);
  }, []);
}
