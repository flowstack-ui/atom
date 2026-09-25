import { clamp, inlineOffset, thumbGeometry } from "./geometry.js";
import type {
  ScrollAreaAxis,
  ScrollAreaController,
  ScrollAreaScrollToDetails,
  ScrollAreaState,
  UseScrollAreaProps,
} from "./types.js";

type Part =
  | "root"
  | "viewport"
  | "content"
  | "corner"
  | "horizontal"
  | "vertical"
  | "horizontal-thumb"
  | "vertical-thumb";
const initial: ScrollAreaState = {
  isAtTop: true,
  isAtBottom: true,
  isAtLeft: true,
  isAtRight: true,
  hasOverflowX: false,
  hasOverflowY: false,
};
const axes = ["horizontal", "vertical"] as const;
const flag = (el: HTMLElement | undefined, name: string, value: boolean) =>
  el?.toggleAttribute(`data-${name}`, value);

export function createScrollAreaController(
  options: UseScrollAreaProps,
  observeNative: boolean,
) {
  const nodes = new Map<Part, HTMLElement>();
  const listeners = new Set<() => void>();
  let state = initial,
    revision = 0,
    mounted = false,
    hovering = false;
  let dragging: ScrollAreaAxis | null = null;
  let scrolling = { horizontal: false, vertical: false };
  let frame = 0,
    animation = 0;
  let nativeAnimation = false;
  let disposeObservers = () => {},
    disposeDrag = () => {};
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;
  let current = options;
  let lastLeft = 0,
    lastTop = 0;
  const viewport = () => nodes.get("viewport");
  const win = () => viewport()?.ownerDocument.defaultView;
  const rtl = () =>
    !!viewport() && win()?.getComputedStyle(viewport()!).direction === "rtl";
  const emit = () => {
    revision++;
    listeners.forEach((fn) => fn());
  };
  const enabled = (axis: ScrollAreaAxis) =>
    (current.orientation ?? "vertical") === "both" ||
    (current.orientation ?? "vertical") === axis;
  const overflowing = (axis: ScrollAreaAxis) =>
    axis === "horizontal" ? state.hasOverflowX : state.hasOverflowY;

  function paint() {
    const parts = [...nodes.values()];
    const ready =
      !!win()?.ResizeObserver &&
      !!win()?.MutationObserver &&
      !!viewport() &&
      !!nodes.get("content") &&
      axes.every(
        (axis) =>
          !enabled(axis) || (!!nodes.get(axis) && !!nodes.get(`${axis}-thumb`)),
      );
    for (const el of parts) {
      flag(el, "overflow-x", state.hasOverflowX);
      flag(el, "overflow-y", state.hasOverflowY);
      flag(el, "hover", hovering);
      flag(el, "custom-ready", ready);
    }
    const v = viewport();
    if (!v) return;
    for (const edge of ["Top", "Bottom", "Left", "Right"] as const)
      flag(v, `at-${edge.toLowerCase()}`, state[`isAt${edge}`]);
    for (const axis of axes) {
      const track = nodes.get(axis),
        thumb = nodes.get(`${axis}-thumb`);
      for (const el of [track, thumb]) {
        flag(el, "scrolling", scrolling[axis]);
        flag(el, "dragging", dragging === axis);
        el?.setAttribute(
          "data-state",
          overflowing(axis) ? "visible" : "hidden",
        );
      }
      if (!track || !thumb) continue;
      const horizontal = axis === "horizontal";
      const minimum =
        parseFloat(
          win()!.getComputedStyle(thumb)[horizontal ? "minWidth" : "minHeight"],
        ) || 0;
      const g = thumbGeometry(
        horizontal ? v.clientWidth : v.clientHeight,
        horizontal ? v.scrollWidth : v.scrollHeight,
        horizontal ? track.clientWidth : track.clientHeight,
        minimum,
        horizontal ? inlineOffset(v, rtl()) : v.scrollTop,
      );
      thumb.style.setProperty(horizontal ? "width" : "height", `${g.length}px`);
      const position = horizontal && rtl() ? -g.position : g.position;
      thumb.style.transform = horizontal
        ? `translateX(${position}px)`
        : `translateY(${position}px)`;
    }
    const both = state.hasOverflowX && state.hasOverflowY;
    nodes
      .get("corner")
      ?.setAttribute("data-state", both ? "visible" : "hidden");
  }

  function measure() {
    const v = viewport();
    if (!v) return;
    const x = inlineOffset(v, rtl()),
      y = clamp(v.scrollTop, v.scrollHeight - v.clientHeight);
    const maxX = Math.max(0, v.scrollWidth - v.clientWidth),
      maxY = Math.max(0, v.scrollHeight - v.clientHeight);
    const next = {
      hasOverflowX: enabled("horizontal") && maxX > 1,
      hasOverflowY: enabled("vertical") && maxY > 1,
      isAtTop: y <= 1,
      isAtBottom: maxY - y <= 1,
      isAtLeft: rtl() ? maxX - x <= 1 : x <= 1,
      isAtRight: rtl() ? x <= 1 : maxX - x <= 1,
    };
    state = next;
    paint();
    emit();
  }

  function schedule() {
    const w = win();
    if (!mounted || !w || frame) return;
    frame = w.requestAnimationFrame(() => {
      frame = 0;
      measure();
    });
  }
  function observe() {
    disposeObservers();
    const v = viewport(),
      w = win();
    if (
      !mounted ||
      !v ||
      !w ||
      (!observeNative &&
        !nodes.get("content") &&
        !nodes.get("horizontal") &&
        !nodes.get("vertical"))
    )
      return;
    if (!w.ResizeObserver || !w.MutationObserver) return;
    const ro = new w.ResizeObserver(schedule);
    for (const node of nodes.values()) ro.observe(node);
    const mo = new w.MutationObserver(schedule);
    // Do not observe our own geometry/data writes, which would create a feedback loop.
    mo.observe(nodes.get("content") ?? v, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    v.addEventListener("load", schedule, true);
    w.addEventListener("resize", schedule);
    v.ownerDocument.fonts?.addEventListener("loadingdone", schedule);
    disposeObservers = () => {
      ro.disconnect();
      mo.disconnect();
      v.removeEventListener("load", schedule, true);
      w.removeEventListener("resize", schedule);
      v.ownerDocument.fonts?.removeEventListener("loadingdone", schedule);
    };
    schedule();
  }

  function register(part: Part, node: HTMLElement | null) {
    if (nodes.get(part) === node) return;
    if (node && nodes.has(part))
      throw new Error(`ScrollArea accepts one ${part} per Root.`);
    if (!node && part === "viewport") {
      // Cancel against the old owner window before losing its reference.
      cancel();
      win()?.cancelAnimationFrame(frame);
      frame = 0;
      clearTimeout(scrollTimer);
      scrolling = { horizontal: false, vertical: false };
    }
    if (node) nodes.set(part, node);
    else {
      nodes.delete(part);
      if (dragging) disposeDrag();
    }
    observe();
    paint();
    schedule();
  }
  function cancel() {
    const active = !!animation || nativeAnimation;
    if (animation) {
      win()?.cancelAnimationFrame(animation);
      animation = 0;
    }
    nativeAnimation = false;
    const v = viewport();
    if (v && active)
      v.scrollTo({ left: v.scrollLeft, top: v.scrollTop, behavior: "instant" });
  }
  function scrollTo(details: ScrollAreaScrollToDetails) {
    const duration = details.duration ?? 300;
    if (!Number.isFinite(duration) || duration < 0)
      throw new RangeError(
        "ScrollArea duration must be a finite nonnegative number.",
      );
    const v = viewport(),
      w = win();
    if (!v || !w) return;
    cancel();
    const maxX = Math.max(0, v.scrollWidth - v.clientWidth),
      maxY = Math.max(0, v.scrollHeight - v.clientHeight);
    const left =
      details.left === undefined
        ? v.scrollLeft
        : rtl()
          ? -clamp(-details.left, maxX)
          : clamp(details.left, maxX);
    const top =
      details.top === undefined ? v.scrollTop : clamp(details.top, maxY);
    if (
      w.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (details.duration === undefined && !details.easing)
    ) {
      nativeAnimation =
        details.behavior === "smooth" &&
        !w.matchMedia("(prefers-reduced-motion: reduce)").matches;
      v.scrollTo({
        top,
        left,
        behavior: w.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : (details.behavior ?? "auto"),
      });
      schedule();
      return;
    }
    if (!duration) {
      v.scrollTo({ top, left, behavior: "instant" });
      schedule();
      return;
    }
    const fromX = v.scrollLeft,
      fromY = v.scrollTop,
      start = w.performance.now();
    const tick = (time: number) => {
      const progress = clamp((time - start) / duration, 1);
      const eased = details.easing?.(progress) ?? progress;
      if (!Number.isFinite(eased)) {
        animation = 0;
        throw new RangeError("ScrollArea easing must return a finite number.");
      }
      const value = progress === 1 ? 1 : clamp(eased, 1);
      v.scrollTo({
        left: fromX + (left - fromX) * value,
        top: fromY + (top - fromY) * value,
        behavior: "instant",
      });
      schedule();
      animation = progress < 1 ? w.requestAnimationFrame(tick) : 0;
    };
    animation = w.requestAnimationFrame(tick);
  }

  const api: ScrollAreaController = {
    get orientation() {
      return current.orientation ?? "vertical";
    },
    get isAtTop() {
      return state.isAtTop;
    },
    get isAtBottom() {
      return state.isAtBottom;
    },
    get isAtLeft() {
      return state.isAtLeft;
    },
    get isAtRight() {
      return state.isAtRight;
    },
    get hasOverflowX() {
      return state.hasOverflowX;
    },
    get hasOverflowY() {
      return state.hasOverflowY;
    },
    viewportRef: (node) => register("viewport", node),
    contentRef: (node) => register("content", node),
    getScrollProgress() {
      const v = viewport();
      return v
        ? {
            x:
              inlineOffset(v, rtl()) /
              Math.max(1, v.scrollWidth - v.clientWidth),
            y:
              clamp(v.scrollTop, v.scrollHeight - v.clientHeight) /
              Math.max(1, v.scrollHeight - v.clientHeight),
          }
        : { x: 0, y: 0 };
    },
    scrollTo,
    scrollToEdge({ edge, ...details }) {
      const v = viewport();
      if (!v) return;
      if (edge === "top" || edge === "bottom")
        scrollTo({ ...details, top: edge === "top" ? 0 : v.scrollHeight });
      else
        scrollTo({
          ...details,
          left:
            edge === "left"
              ? rtl()
                ? -v.scrollWidth
                : 0
              : rtl()
                ? 0
                : v.scrollWidth,
        });
    },
    getScrollbarState({ orientation = "vertical" }) {
      return {
        hidden: !overflowing(orientation),
        hovering,
        scrolling: scrolling[orientation],
        dragging: dragging === orientation,
      };
    },
  };

  return {
    api,
    register,
    cancel,
    schedule,
    id: (part: Part) =>
      part === "root"
        ? current.ids?.root
        : part.includes("thumb")
          ? current.ids?.thumb && `${current.ids.thumb}-${part.split("-")[0]}`
          : axes.includes(part as ScrollAreaAxis)
            ? current.ids?.scrollbar && `${current.ids.scrollbar}-${part}`
            : current.ids?.[part as "viewport" | "content" | "corner"],
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    getSnapshot: () => revision,
    getServerSnapshot: () => 0,
    configure(next: UseScrollAreaProps) {
      const changed = next.orientation !== current.orientation;
      const idsChanged =
        JSON.stringify(next.ids) !== JSON.stringify(current.ids);
      current = next;
      if (changed) disposeDrag();
      if (changed || idsChanged) {
        emit();
        schedule();
      }
    },
    mount() {
      mounted = true;
      observe();
      schedule();
      return () => {
        mounted = false;
        disposeObservers();
        disposeDrag();
        cancel();
        win()?.cancelAnimationFrame(frame);
        frame = 0;
        clearTimeout(scrollTimer);
      };
    },
    hover(value: boolean) {
      hovering = value;
      paint();
      emit();
    },
    onScroll() {
      const v = viewport();
      if (!v) return;
      scrolling = {
        horizontal: scrolling.horizontal || v.scrollLeft !== lastLeft,
        vertical: scrolling.vertical || v.scrollTop !== lastTop,
      };
      lastLeft = v.scrollLeft;
      lastTop = v.scrollTop;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        nativeAnimation = false;
        scrolling = { horizontal: false, vertical: false };
        paint();
        emit();
      }, 150);
      schedule();
    },
    pointerDown(event: PointerEvent, axis: ScrollAreaAxis, isThumb: boolean) {
      const track = nodes.get(axis),
        v = viewport(),
        w = win();
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        !event.isPrimary ||
        !track ||
        !v ||
        !w ||
        !overflowing(axis)
      )
        return;
      cancel();
      disposeDrag();
      const thumb = nodes.get(`${axis}-thumb`);
      if (!thumb) return;
      const horizontal = axis === "horizontal",
        box = track.getBoundingClientRect(),
        tbox = thumb.getBoundingClientRect();
      const minimum =
        parseFloat(
          w.getComputedStyle(thumb)[horizontal ? "minWidth" : "minHeight"],
        ) || 0;
      const g = thumbGeometry(
        horizontal ? v.clientWidth : v.clientHeight,
        horizontal ? v.scrollWidth : v.scrollHeight,
        horizontal ? track.clientWidth : track.clientHeight,
        minimum,
        0,
      );
      const grab = isThumb
        ? horizontal
          ? event.clientX - tbox.left
          : event.clientY - tbox.top
        : g.length / 2;
      const move = (e: PointerEvent) => {
        if (e.pointerId !== event.pointerId) return;
        let position =
          (horizontal ? e.clientX - box.left : e.clientY - box.top) - grab;
        if (horizontal && rtl()) position = g.travel - position;
        const offset = g.travel
          ? (clamp(position, g.travel) / g.travel) * g.extent
          : 0;
        if (horizontal) v.scrollLeft = rtl() ? -offset : offset;
        else v.scrollTop = offset;
        schedule();
      };
      const finish = () => {
        track.removeEventListener("pointermove", move);
        track.removeEventListener("pointerup", finish);
        track.removeEventListener("pointercancel", finish);
        track.removeEventListener("lostpointercapture", finish);
        w.removeEventListener("blur", finish);
        if (track.hasPointerCapture(event.pointerId))
          track.releasePointerCapture(event.pointerId);
        dragging = null;
        paint();
        emit();
        disposeDrag = () => {};
      };
      disposeDrag = finish;
      dragging = axis;
      track.setPointerCapture(event.pointerId);
      track.addEventListener("pointermove", move);
      track.addEventListener("pointerup", finish);
      track.addEventListener("pointercancel", finish);
      track.addEventListener("lostpointercapture", finish);
      w.addEventListener("blur", finish);
      event.preventDefault();
      event.stopPropagation();
      if (!isThumb) move(event);
      paint();
      emit();
    },
  };
}

export type ScrollAreaEngine = ReturnType<typeof createScrollAreaController>;
