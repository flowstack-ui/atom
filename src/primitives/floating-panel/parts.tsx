"use client";

import * as React from "react";
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type CSSProperties } from "react";
import { useOverlayPresence } from "../../hooks/useOverlayPresence.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import type { NativeDivProps, NativeButtonProps } from "../../utils/dom.js";
import { Portal } from "../../utils/Portal.js";
import { useOptionalModalContext } from "../modal/context.js";
import { ButtonRoot, type ButtonRootProps } from "../button/ButtonRoot.js";
import { usePanelContext } from "./context.js";
import { usePanelInteraction } from "./interaction.js";
import type { FloatingPanelAxis, FloatingPanelStage } from "./geometry.js";

export const FloatingPanelPortal = Portal;
export interface FloatingPanelPartProps extends NativeDivProps<"children"> { children?: ReactNode; asChild?: boolean; render?: RenderProp; "data-slot"?: string }
function element(tag: string, children: ReactNode, asChild: boolean | undefined, render: RenderProp | undefined, props: Record<string, unknown>) {
  if (tag === "button") return <ButtonRoot {...props as ButtonRootProps} asChild={asChild} render={render}>{children}</ButtonRoot>;
  return asChild ? cloneAndMerge(children, props) : renderElement(render, tag, { ...props, children });
}
function usePartRef(ref: React.ForwardedRef<HTMLDivElement>, kind: "content" | "positioner" | "header") {
  const c = usePanelContext();
  const lastNode = useRef<HTMLDivElement | null>(null);
  const lastOpen = useRef<boolean | undefined>(undefined);
  return useMemo(() => composeRefs(ref, (node: HTMLDivElement | null) => {
    c[kind].current = node;
    // A render/asChild merge may detach and reattach a callback ref without
    // replacing its node. Do not publish another mount for that same host.
    if (node && (lastNode.current !== node || lastOpen.current !== c.open)) {
      lastNode.current = node; lastOpen.current = c.open; c.mounted();
    }
  }), [ref, c[kind], c.mounted, c.open]);
}
function data(c: ReturnType<typeof usePanelContext>) {
  return { "data-state": c.open ? "open" : "closed", "data-stage": c.stage, "data-dragging": c.dragging ? "" : undefined,
    "data-resizing": c.resizing ? "" : undefined, "data-topmost": c.topmost ? "" : undefined, "data-disabled": c.options.disabled ? "" : undefined };
}
export const FloatingPanelPositioner = forwardRef<HTMLDivElement, FloatingPanelPartProps>(function FloatingPanelPositioner({ children, asChild, render, style, "data-slot": slot = "floating-panel-positioner", ...props }, ref) {
  const c = usePanelContext(), merged = usePartRef(ref, "positioner");
  const b = c.boundary();
  const constrained = Boolean(b && c.options.minSize && (b.width < c.options.minSize.width || b.height < c.options.minSize.height));
  return element("div", children, asChild, render, { ...props, ...data(c), ref: merged, "data-slot": slot,
    "data-constrained": constrained ? "" : undefined, id: c.options.ids?.positioner ?? `${c.id}-positioner`, dir: c.dir,
    style: { ...style, position: c.options.strategy ?? "fixed", left: c.position.x, top: c.position.y, width: c.size.width, height: c.size.height,
      "--atom-floating-panel-layer": Math.max(0, c.index), visibility: c.open && !c.ready ? "hidden" : style?.visibility, pointerEvents: c.open ? style?.pointerEvents : "none" } });
});
export const FloatingPanelContent = forwardRef<HTMLDivElement, FloatingPanelPartProps>(function FloatingPanelContent({ children, asChild, render, style, onPointerDown, onFocus, onKeyDown, "data-slot": slot = "floating-panel-content", ...props }, ref) {
  const c = usePanelContext(), merged = usePartRef(ref, "content"), parent = useOptionalModalContext();
  const presence = useOverlayPresence({ ...c.options, open: c.open });
  // Reset only after the hidden/unmounted commit, never during visible exit.
  useEffect(() => {
    if (!presence.visible && !c.open) c.resetAfterExit();
  }, [presence.visible, c.open, c.resetAfterExit]);
  const combined = useMemo(() => composeRefs(merged, presence.ref, presence.node), [merged, presence.ref, presence.node]);
  const interaction = usePanelInteraction(c);
  useLayoutEffect(() => { if (c.content.current) c.content.current.inert = !presence.interactive; }, [presence.interactive, presence.mounted, c.content]);
  useEffect(() => { if (presence.interactive && c.content.current) return parent?.registerBranch(c.content.current); }, [presence.interactive, c.content, parent?.registerBranch]);
  if (!presence.mounted) return null;
  const attributes = { ...props, ...data(c), ref: combined, "data-slot": slot, id: c.options.ids?.content ?? `${c.id}-content`, dir: c.dir,
    "data-presence": presence.target ? "open" : "closed",
    role: props.role ?? "dialog", tabIndex: props.tabIndex ?? -1,
    "aria-labelledby": props["aria-label"] ? undefined : props["aria-labelledby"] ?? c.options.ids?.title ?? `${c.id}-title`,
    "aria-describedby": props["aria-describedby"] ?? (c.descriptions ? c.options.ids?.description ?? `${c.id}-description` : undefined), "aria-hidden": !presence.interactive ? true : undefined, inert: !presence.interactive ? true : undefined,
    hidden: !presence.visible || props.hidden, style: { ...style, width: "100%", height: "100%", boxSizing: "border-box", ...(!presence.visible ? { display: "none" } : {}), ...(presence.skipEntry ? { animation: "none", transition: "none" } : {}) },
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => { onPointerDown?.(event); if (!event.defaultPrevented && event.currentTarget.contains(event.target as Node)) c.bringToFront(); },
    onFocus: (event: React.FocusEvent<HTMLDivElement>) => { onFocus?.(event); if (!event.defaultPrevented && event.currentTarget.contains(event.target as Node)) c.bringToFront(); },
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => { onKeyDown?.(event); if (!event.defaultPrevented) interaction.onKeyDown(event); } };
  const output = element("div", children, asChild, render, attributes);
  if (c.options.hideMode === "activity") {
    const Activity = (React as unknown as { Activity?: React.ComponentType<{ mode: "visible" | "hidden"; children: ReactNode }> }).Activity;
    if (!Activity) throw new Error("FloatingPanel hideMode=activity requires a React runtime with Activity support (React 19.2+). Use display-none on earlier React versions.");
    return <Activity mode={presence.visible ? "visible" : "hidden"}>{output}</Activity>;
  }
  return output;
});
function simplePart(name: string, tag = "div") {
  return forwardRef<HTMLDivElement, FloatingPanelPartProps>(function Part({ children, asChild, render, "data-slot": slot = `floating-panel-${name}`, ...props }, ref) {
    const c = usePanelContext();
    useEffect(() => name === "description" ? c.registerDescription() : undefined, [c.registerDescription]);
    return element(tag, children, asChild, render, { ...props, ref, "data-slot": slot, ...data(c),
      ...(name === "title" || name === "description" ? { id: c.options.ids?.[name] ?? `${c.id}-${name}` } : {}),
      ...(name === "body" ? { hidden: c.stage === "minimized" || props.hidden, inert: c.stage === "minimized" ? true : undefined,
        style: { ...props.style, ...(c.stage === "minimized" ? { display: "none" } : {}) } } : {}) });
  });
}
export const FloatingPanelTitle = simplePart("title");
export const FloatingPanelDescription = simplePart("description", "p");
export const FloatingPanelBody = simplePart("body");
export const FloatingPanelControl = simplePart("control");
export const FloatingPanelHeader = forwardRef<HTMLDivElement, FloatingPanelPartProps>(function FloatingPanelHeader({ children, asChild, render, onDoubleClick, "data-slot": slot = "floating-panel-header", ...props }, ref) {
  const c = usePanelContext(), merged = usePartRef(ref, "header");
  return element("div", children, asChild, render, { ...props, ...data(c), ref: merged, "data-slot": slot, id: c.options.ids?.header ?? `${c.id}-header`,
    onDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => {
      onDoubleClick?.(event);
      if (event.defaultPrevented || c.options.disabled || c.options.resizable === false || (event.target as HTMLElement).closest("button,a,input,[data-no-drag]")) return;
      c.stage === "default" ? c.maximize() : c.restore();
    } });
});
export interface FloatingPanelResizeTriggerProps extends FloatingPanelPartProps { axis: FloatingPanelAxis }
export const FloatingPanelResizeTrigger = forwardRef<HTMLDivElement, FloatingPanelResizeTriggerProps>(function FloatingPanelResizeTrigger({ axis, children, asChild, render, style, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, onKeyDown, "data-slot": slot = "floating-panel-resize-trigger", ...props }, ref) {
  if (!["n", "s", "e", "w", "ne", "nw", "se", "sw"].includes(axis)) throw new Error("FloatingPanel.ResizeTrigger requires a physical resize axis.");
  const c = usePanelContext(), handlers = usePanelInteraction(c, axis);
  const locations: CSSProperties = { position: "absolute", touchAction: "none", ...(axis.includes("n") ? { top: 0 } : axis.includes("s") ? { bottom: 0 } : { top: 0, bottom: 0 }),
    ...(axis.includes("w") ? { left: 0 } : axis.includes("e") ? { right: 0 } : { left: 0, right: 0 }) };
  const attributes = { ...props, ...data(c), ref, "data-slot": slot, "data-axis": axis, role: props.role ?? "button", tabIndex: handlers.disabled ? -1 : props.tabIndex ?? 0,
    "aria-label": props["aria-label"] ?? `${c.options.translations?.resize ?? "Resize panel"} ${axis}`, "aria-disabled": handlers.disabled || undefined,
    hidden: handlers.disabled || props.hidden, style: { ...style, ...locations },
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => { onPointerDown?.(e); if (!e.defaultPrevented) handlers.onPointerDown(e); },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => { onPointerMove?.(e); if (!e.defaultPrevented) handlers.onPointerMove(e); },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => { onPointerUp?.(e); handlers.onPointerUp(e); },
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => { onPointerCancel?.(e); handlers.onPointerCancel(e); },
    onLostPointerCapture: (e: React.PointerEvent<HTMLDivElement>) => { onLostPointerCapture?.(e); handlers.onLostPointerCapture(e); },
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => { onKeyDown?.(e); if (!e.defaultPrevented) handlers.onKeyDown(e); } };
  return element("div", children, asChild, render, attributes);
});
export const FloatingPanelDragTrigger = forwardRef<HTMLDivElement, FloatingPanelPartProps>(function FloatingPanelDragTrigger({ children, asChild, render, style, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, onKeyDown, "data-slot": slot = "floating-panel-drag-trigger", ...props }, ref) {
  const c = usePanelContext(), handlers = usePanelInteraction(c);
  return element("div", children, asChild, render, { ...props, ...data(c), ref, "data-slot": slot, tabIndex: handlers.disabled ? -1 : props.tabIndex ?? 0,
    "aria-label": props["aria-label"] ?? c.options.translations?.move ?? "Move panel with arrow keys; Control or Command plus arrows resizes", style: { ...style, touchAction: "none" },
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => { onPointerDown?.(e); if (!e.defaultPrevented) handlers.onPointerDown(e); },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => { onPointerMove?.(e); if (!e.defaultPrevented) handlers.onPointerMove(e); },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => { onPointerUp?.(e); handlers.onPointerUp(e); },
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => { onPointerCancel?.(e); handlers.onPointerCancel(e); },
    onLostPointerCapture: (e: React.PointerEvent<HTMLDivElement>) => { onLostPointerCapture?.(e); handlers.onLostPointerCapture(e); },
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => { onKeyDown?.(e); if (!e.defaultPrevented) handlers.onKeyDown(e); } });
});
export interface FloatingPanelResizeTriggersProps { axes?: readonly FloatingPanelAxis[] }
export function FloatingPanelResizeTriggers({ axes = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] }: FloatingPanelResizeTriggersProps) { return <>{axes.map(axis => <FloatingPanelResizeTrigger key={axis} axis={axis} />)}</>; }
export interface FloatingPanelButtonProps extends NativeButtonProps<"children"> { children?: ReactNode; asChild?: boolean; render?: RenderProp; "data-slot"?: string }
function authoredLabel(children: ReactNode, asChild: boolean | undefined, render: RenderProp | undefined) {
  const child = asChild ? children : render;
  return React.isValidElement<{ "aria-label"?: string }>(child) ? child.props["aria-label"] : undefined;
}
export interface FloatingPanelStageTriggerProps extends FloatingPanelButtonProps { stage: FloatingPanelStage }
export const FloatingPanelStageTrigger = forwardRef<HTMLButtonElement, FloatingPanelStageTriggerProps>(function FloatingPanelStageTrigger({ stage, children, asChild, render, disabled, onClick, "data-slot": slot = "floating-panel-stage-trigger", ...props }, ref) {
  const c = usePanelContext();
  if (!["default", "minimized", "maximized"].includes(stage)) throw new Error("FloatingPanel.StageTrigger requires a valid stage.");
  const name = stage === "default" ? "restore" : stage === "minimized" ? "minimize" : "maximize";
  return element("button", children, asChild, render, { ...props, ...data(c), ref, type: props.type ?? "button", "data-slot": slot,
    "aria-label": props["aria-label"] ?? authoredLabel(children, asChild, render) ?? c.options.translations?.[name] ?? `${name} panel`, disabled: disabled || c.options.disabled || c.options.resizable === false,
    hidden: stage === c.stage || (stage === "default" && c.stage === "default") || props.hidden,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => { onClick?.(e); if (!e.defaultPrevented && !disabled && !c.options.disabled && c.options.resizable !== false) c[name](); } });
});
export const FloatingPanelCloseTrigger = forwardRef<HTMLButtonElement, FloatingPanelButtonProps>(function FloatingPanelCloseTrigger({ children, asChild, render, disabled, onClick, "data-slot": slot = "floating-panel-close-trigger", ...props }, ref) {
  const c = usePanelContext();
  return element("button", children, asChild, render, { ...props, ref, type: props.type ?? "button", "data-slot": slot, disabled: disabled || c.options.disabled,
    "aria-label": props["aria-label"] ?? authoredLabel(children, asChild, render) ?? c.options.translations?.close ?? "Close panel",
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => { onClick?.(e); if (!e.defaultPrevented && !disabled && !c.options.disabled) c.setOpen(false); } });
});
export const FloatingPanelTrigger = forwardRef<HTMLButtonElement, FloatingPanelButtonProps>(function FloatingPanelTrigger({ children, asChild, render, disabled, onClick, "data-slot": slot = "floating-panel-trigger", ...props }, ref) {
  const c = usePanelContext(), merged = useMemo(() => composeRefs(ref, c.trigger), [ref, c.trigger]);
  return element("button", children, asChild, render, { ...props, ...data(c), ref: merged, type: props.type ?? "button", "data-slot": slot, id: c.options.ids?.trigger ?? `${c.id}-trigger`,
    disabled: disabled || c.options.disabled, "aria-haspopup": "dialog", "aria-expanded": c.open, "aria-controls": c.options.ids?.content ?? `${c.id}-content`,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => { onClick?.(e); if (!e.defaultPrevented && !disabled && !c.options.disabled) c.setOpen(!c.open); } });
});
