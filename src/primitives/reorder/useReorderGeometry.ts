"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { useDragDropContext } from "../drag-drop/context.js";
import { useReorderContext } from "./context.js";
import { reorderItems } from "./utils.js";
const useGeometryEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

type Point = { x: number; y: number };
function translate(node: HTMLElement): Point {
  const values = (node.ownerDocument.defaultView?.getComputedStyle(node).translate ?? "none").split(" ").map(value => parseFloat(value) || 0);
  return { x: values[0] ?? 0, y: values[1] ?? 0 };
}
function write(node: HTMLElement, point: Point) {
  node.style.setProperty("--atom-reorder-x", `${point.x}px`);
  node.style.setProperty("--atom-reorder-y", `${point.y}px`);
}

/** Item registration only. All collection reads and writes are batched below. */
export function useReorderGeometry(value: string, element: RefObject<HTMLLIElement | null>) {
  const { elements } = useReorderContext();
  useGeometryEffect(() => {
    const node = element.current;
    if (!node) return;
    node.setAttribute("data-reorder-geometry", "");
    elements.set(value, node);
    return () => { elements.delete(value); node.removeAttribute("data-reorder-geometry"); };
  }, [element, elements, value]);
}

/** Measure a tentative CSS layout without moving React-owned DOM or focus.
 * CSS order is restored synchronously, before the browser can paint. */
export function ReorderGeometry() {
  const { state } = useDragDropContext();
  const { items, elements, displacement } = useReorderContext();
  const previous = useRef(new Map<string, Point>());
  const latest = useRef(state);
  const pointer = useRef<{ value: string; point: Point; preview: boolean } | null>(null);
  latest.current = state;
  if (state.activeValue && state.input === "pointer" && state.sourceRect) {
    pointer.current = { value: state.activeValue, preview: false, point: { x: state.sourceRect.x + state.deltaX, y: state.sourceRect.y + state.deltaY } };
  }
  if (pointer.current) pointer.current.preview = Boolean(elements.get(pointer.current.value)?.hasAttribute("data-previewing"));
  useGeometryEffect(() => {
    const nodes = items.map(value => ({ value, node: elements.get(value) })).filter((entry): entry is { value: string; node: HTMLElement } => Boolean(entry.node));
    const parent = nodes[0]?.node.parentElement;
    const win = parent?.ownerDocument.defaultView;
    if (!parent || !win) return;
    let frame = 0;
    const measure = (resized = false) => {
      win.cancelAnimationFrame(frame);
      const current = latest.current;
      const baseline = new Map(nodes.map(({ value, node }) => [value, { x: node.offsetLeft, y: node.offsetTop }]));
      const visible = new Map(nodes.map(({ value, node }) => [value, translate(node)]));
      const deltas = new Map<string, Point>();
      const style = win.getComputedStyle(parent);
      const eligible = displacement === "auto" && (current.input !== "pointer" || Boolean(current.activeValue && elements.get(current.activeValue)?.hasAttribute("data-previewing"))) && /^(grid|inline-grid|flex|inline-flex)$/.test(style.display)
        && !/reverse/.test(style.flexDirection) && !/dense/.test(style.gridAutoFlow)
        && nodes.every(({ node }) => node.parentElement === parent && win.getComputedStyle(node).order === "0");
      if (current.activeValue && current.overValue && current.position && eligible) {
        const result = reorderItems(items, current.activeValue, current.overValue, current.position);
        const indexes = new Map(result.items.map((value, index) => [value, index]));
        const before = nodes.map(({ node }) => ({ width: node.offsetWidth, height: node.offsetHeight, order: node.style.getPropertyValue("order"), priority: node.style.getPropertyPriority("order") }));
        try {
          nodes.forEach(({ value, node }) => node.style.setProperty("order", String(indexes.get(value)), "important"));
          const projected = nodes.map(({ node }) => ({ x: node.offsetLeft, y: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight }));
          if (projected.every((rect, i) => rect.width === before[i]!.width && rect.height === before[i]!.height)) {
            nodes.forEach(({ value }, i) => {
              const base = baseline.get(value)!;
              deltas.set(value, { x: projected[i]!.x - base.x, y: projected[i]!.y - base.y });
            });
          }
        } finally {
          nodes.forEach(({ node }, i) => before[i]!.order ? node.style.setProperty("order", before[i]!.order, before[i]!.priority) : node.style.removeProperty("order"));
        }
      }
      if (!current.activeValue && resized) {
        nodes.forEach(({ node }) => { node.setAttribute("data-reorder-measuring", ""); write(node, { x: 0, y: 0 }); });
        parent.getBoundingClientRect();
        frame = win.requestAnimationFrame(() => nodes.forEach(({ node }) => node.removeAttribute("data-reorder-measuring")));
      } else if (!current.activeValue) {
        const settling = nodes.map(({ value, node }) => {
          const base = baseline.get(value)!;
          const old = previous.current.get(value) ?? base;
          const delta = visible.get(value)!;
          const returning = pointer.current?.value === value && pointer.current.preview ? pointer.current.point : null;
          const rect = returning ? node.getBoundingClientRect() : null;
          return { node, point: returning && rect
            ? { x: returning.x - rect.x + delta.x, y: returning.y - rect.y + delta.y }
            : { x: old.x - base.x + delta.x, y: old.y - base.y + delta.y } };
        });
        settling.forEach(({ node, point }) => { node.setAttribute("data-reorder-measuring", ""); write(node, point); });
        parent.getBoundingClientRect();
        frame = win.requestAnimationFrame(() => nodes.forEach(({ node }) => { node.removeAttribute("data-reorder-measuring"); write(node, { x: 0, y: 0 }); }));
        pointer.current = null;
      } else {
        nodes.forEach(({ value, node }) => write(node, value === current.activeValue && current.input === "pointer" ? { x: 0, y: 0 } : deltas.get(value) ?? { x: 0, y: 0 }));
      }
      previous.current = baseline;
    };
    measure();
    let observed = false;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      // Initial observer delivery is not a resize and must not interrupt settling.
      if (!observed) { observed = true; return; }
      measure(true);
    });
    observer?.observe(parent);
    nodes.forEach(({ node }) => observer?.observe(node));
    return () => { observer?.disconnect(); win.cancelAnimationFrame(frame); nodes.forEach(({ node }) => node.removeAttribute("data-reorder-measuring")); };
  }, [displacement, elements, items, state.activeValue, state.overValue, state.position]);
  return null;
}
