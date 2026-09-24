"use client";

import { createContext, forwardRef, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode, type FocusEvent, type AnimationEvent } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useMarquee, type InternalMarquee, type MarqueeController, type MarqueeOptions } from "./controller.js";
import { invalidMarqueeReplica } from "./geometry.js";

const Context = createContext<InternalMarquee | null>(null);
const useLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;
Context.displayName = "MarqueeContext";
function useInternalMarquee() {
  const value = useContext(Context);
  if (!value) throw new Error("Marquee parts require Marquee.Root or Marquee.RootProvider.");
  return value;
}
export function useMarqueeContext(): MarqueeController { return useInternalMarquee(); }
export interface MarqueePartProps extends NativeDivProps<"children"> { children?: ReactNode; asChild?: boolean; render?: RenderProp; "data-slot"?: string }
export interface MarqueeRootProps extends Omit<MarqueePartProps, "id" | "dir">, MarqueeOptions {}
export interface MarqueeRootProviderProps extends Omit<MarqueePartProps, "dir"> { value: ReturnType<typeof useMarquee> }
export interface MarqueeContentProps extends MarqueePartProps { renderReplica?: (index: number) => ReactNode }
export interface MarqueeContextProps { children: (value: MarqueeController) => ReactNode }
export type MarqueeViewportProps = MarqueePartProps;
export type MarqueeItemProps = MarqueePartProps;

export const MarqueeRootProvider = forwardRef<HTMLDivElement, MarqueeRootProviderProps>(function MarqueeRootProvider({ value, children, asChild, render, style, onPointerEnter, onPointerLeave, onFocusCapture, onBlurCapture, "data-slot": slot = "marquee", ...props }, ref) {
  const composedRef = useMemo(() => composeRefs(value.setRoot, ref), [value.setRoot, ref]);
  const host = { ...props, ref: composedRef, id: props.id ?? value.id, dir: value.dir,
    role: props.role ?? (props["aria-label"] || props["aria-labelledby"] || value.options.translations?.regionLabel ? "region" : undefined),
    "aria-label": props["aria-label"] ?? value.options.translations?.regionLabel,
    "aria-live": "off", "data-slot": slot, "data-state": value.completed ? "completed" : value.paused ? "paused" : "playing",
    "data-static": value.static ? "" : undefined, "data-orientation": value.orientation, "data-side": value.side,
    "data-reversed": value.reversed ? "" : undefined, "data-generation": value.generation % 2,
    style: { ...style, "--atom-marquee-spacing": value.spacing, "--atom-marquee-distance": `${value.distance}px`, "--atom-marquee-duration": `${value.duration}s`, "--atom-marquee-delay": `${value.delay}s`, "--atom-marquee-iterations": value.remaining || "infinite" } as CSSProperties,
    onPointerEnter: composeEventHandlers(onPointerEnter, () => value.setHovered(true)),
    onPointerLeave: composeEventHandlers(onPointerLeave, () => value.setHovered(false)),
    onFocusCapture: (event: FocusEvent<HTMLDivElement>) => { onFocusCapture?.(event); value.setFocused(true); },
    onBlurCapture: (event: FocusEvent<HTMLDivElement>) => { onBlurCapture?.(event); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) value.setFocused(false); },
  };
  return <Context.Provider value={value}>{asChild ? cloneAndMerge(children, host) : renderElement(render, "div", { ...host, children })}</Context.Provider>;
});
export const MarqueeRoot = forwardRef<HTMLDivElement, MarqueeRootProps>(function MarqueeRoot({ id, ids, dir, side, reverse, speed, spacing, delay, loopCount, autoFill, paused, defaultPaused, pauseOnInteraction, translations, onPauseChange, onLoopComplete, onComplete, ...props }, ref) {
  const value = useMarquee({ id, ids, dir, side, reverse, speed, spacing, delay, loopCount, autoFill, paused, defaultPaused, pauseOnInteraction, translations, onPauseChange, onLoopComplete, onComplete });
  return <MarqueeRootProvider {...props} value={value} ref={ref} />;
});
export function MarqueeContext({ children }: MarqueeContextProps) { return children(useMarqueeContext()); }

export const MarqueeViewport = forwardRef<HTMLDivElement, MarqueeViewportProps>(function MarqueeViewport({ children, asChild, render, "data-slot": slot = "marquee-viewport", ...props }, ref) {
  const value = useInternalMarquee();
  const localRef = useRef<HTMLDivElement>(null);
  const composedRef = useMemo(() => composeRefs(localRef, value.setViewport, ref), [value.setViewport, ref]);
  useEffect(() => {
    const viewport = localRef.current;
    if (!value.static || !viewport) return;
    const active = viewport.ownerDocument.activeElement;
    const view = viewport.ownerDocument.defaultView;
    if (!view || !(active instanceof view.HTMLElement) || !viewport.contains(active)) return;
    // Scroll only the viewport, never the owning document or unrelated ancestors.
    const target = active.getBoundingClientRect(), bounds = viewport.getBoundingClientRect();
    viewport.scrollLeft += target.left < bounds.left ? target.left - bounds.left : target.right > bounds.right ? target.right - bounds.right : 0;
    viewport.scrollTop += target.top < bounds.top ? target.top - bounds.top : target.bottom > bounds.bottom ? target.bottom - bounds.bottom : 0;
  }, [value.static]);
  const host = { ...props, tabIndex: props.tabIndex ?? (value.static ? 0 : undefined), id: props.id ?? value.options.ids?.viewport ?? `${value.id}-viewport`, ref: composedRef, "data-slot": slot, "data-orientation": value.orientation, "data-static": value.static ? "" : undefined };
  return asChild ? cloneAndMerge(children, host) : renderElement(render, "div", { ...host, children });
});

function Replica({ index, renderReplica, className, style }: { index: number; renderReplica: (index: number) => ReactNode; className?: string; style?: CSSProperties }) {
  const value = useInternalMarquee();
  const localRef = useRef<HTMLDivElement>(null);
  const replicaRef = useCallback((node: HTMLDivElement | null) => { localRef.current = node; node?.setAttribute("inert", ""); }, []);
  useLayout(() => {
    const node = localRef.current;
    const original = node?.parentElement?.querySelector<HTMLElement>("[data-original]");
    if (!node || !original) return;
    if (!original.getAnimations || !node.getAnimations) {
      value.setInvalidReplica(true);
      return;
    }
    // Match only track CSS animations, never descendant artwork animations.
    const source = original.getAnimations?.().filter(a => "animationName" in a) ?? [];
    const copies = node.getAnimations?.().filter(a => "animationName" in a) ?? [];
    let disposed = false;
    const synchronize = () => { for (const animation of copies) {
      const match = source.find(a => (a as CSSAnimation).animationName === (animation as CSSAnimation).animationName);
      if (!match) continue;
      if (!value.paused && match.startTime !== null && match.playState === "running") animation.startTime = match.startTime;
      else if (match.currentTime !== null) animation.currentTime = match.currentTime;
    } };
    synchronize();
    // CSS pause/play changes can still be pending in this layout effect. Align
    // again when the browser has committed them, without taking ownership of
    // playState away from the CSS recipe with imperative pause()/play() calls.
    void Promise.all([...source, ...copies].map(animation => animation.ready)).then(() => {
      if (!disposed) synchronize();
    }, () => { /* A replacement animation cancels the pending transition. */ });
    return () => { disposed = true; };
  }, [value.copyCount, value.generation, value.paused]);
  useEffect(() => {
    const node = localRef.current, view = node?.ownerDocument.defaultView;
    if (!node || !view) return;
    const check = () => { if (invalidMarqueeReplica(node)) value.setInvalidReplica(true); };
    check();
    const observer = new view.MutationObserver(check);
    observer.observe(node, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [value.setInvalidReplica, renderReplica]);
  return <div ref={replicaRef} className={className} style={style} data-slot="marquee-replica" data-replica="" aria-hidden="true" role="presentation">{renderReplica(index)}</div>;
}
export const MarqueeContent = forwardRef<HTMLDivElement, MarqueeContentProps>(function MarqueeContent({ children, renderReplica, asChild, render, onAnimationIteration, onAnimationEnd, "data-slot": slot = "marquee-content", ...props }, ref) {
  const value = useInternalMarquee();
  const composedRef = useMemo(() => composeRefs(value.setContent, ref), [value.setContent, ref]);
  useEffect(() => { value.setHasReplica(!!renderReplica); value.setInvalidReplica(false); return () => value.setHasReplica(false); }, [!!renderReplica, value.setHasReplica, value.setInvalidReplica]);
  const host = { ...props, ref: composedRef, id: props.id ?? value.options.ids?.content ?? `${value.id}-content`, "data-slot": slot, "data-original": "",
    onAnimationIteration: (event: AnimationEvent<HTMLDivElement>) => { onAnimationIteration?.(event); if (event.target === event.currentTarget && !value.static && !value.paused) value.finishIteration(false); },
    onAnimationEnd: (event: AnimationEvent<HTMLDivElement>) => { onAnimationEnd?.(event); if (event.target === event.currentTarget && !value.static && !value.paused && value.remaining > 0) value.finishIteration(true); },
  };
  return <>{asChild ? cloneAndMerge(children, host) : renderElement(render, "div", { ...host, children })}
    {renderReplica && Array.from({ length: value.copyCount }, (_, index) => <Replica key={index} index={index + 1} renderReplica={renderReplica} className={props.className} style={props.style} />)}
  </>;
});
export const MarqueeItem = forwardRef<HTMLDivElement, MarqueeItemProps>(function MarqueeItem({ children, asChild, render, "data-slot": slot = "marquee-item", ...props }, ref) {
  const host = { ...props, ref, "data-slot": slot };
  return asChild ? cloneAndMerge(children, host) : renderElement(render, "div", { ...host, children });
});
