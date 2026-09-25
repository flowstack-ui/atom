"use client";

import { forwardRef, useMemo, type ComponentPropsWithoutRef, type ReactNode } from "react";
import type { NativeDivProps, NativeInputProps, NativeLabelProps, NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useSliderContext } from "./context.js";
import type { SliderController } from "./useSlider.js";

export interface SliderCompositionProps { render?: RenderProp; asChild?: boolean; }

export interface SliderControlProps extends NativeDivProps<"children">, SliderCompositionProps { children?: ReactNode; "data-slot"?: string; }
export const SliderControl = forwardRef<HTMLDivElement, SliderControlProps>(function SliderControl(
  { render, asChild, children, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, style, "data-slot": dataSlot = "slider-control", ...props }, ref,
) {
  const context = useSliderContext();
  const composedRef = useMemo(() => composeRefs(context.controlRef, ref), [context.controlRef, ref]);
  const behavior = {
    ...props,
    id: props.id ?? context.ids.control,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-orientation": context.orientation,
    ...(context.disabled && { "data-disabled": "" }),
    style: { ...style, touchAction: context.orientation === "horizontal" ? "pan-y" : "pan-x" },
    onPointerDown: composeEventHandlers(onPointerDown, context.handleTrackPointerDown),
    onPointerMove: composeEventHandlers(onPointerMove, context.handlePointerMove),
    onPointerUp: composeEventHandlers(onPointerUp, context.handlePointerUp),
    onPointerCancel: composeEventHandlers(onPointerCancel, context.handlePointerCancel),
    onLostPointerCapture: composeEventHandlers(onLostPointerCapture, context.handlePointerUp),
  };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "div", { ...behavior, children });
});

export interface SliderLabelProps extends NativeLabelProps<"children">, SliderCompositionProps { children?: ReactNode; "data-slot"?: string; }
export const SliderLabel = forwardRef<HTMLLabelElement, SliderLabelProps>(function SliderLabel(
  { render, asChild, children, onClick, "data-slot": dataSlot = "slider-label", ...props }, ref,
) {
  const context = useSliderContext();
  const behavior = {
    ...props,
    ref,
    id: props.id ?? context.ids.label,
    htmlFor: props.htmlFor ?? context.ids.thumb(0),
    "data-slot": dataSlot,
    onClick: composeEventHandlers(onClick, () => context.focusThumb(0)),
  };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "label", { ...behavior, children });
});

export interface SliderValueTextDetails { values: number[]; value: number | number[]; }
export interface SliderValueTextProps extends Omit<ComponentPropsWithoutRef<"output">, "children">, SliderCompositionProps {
  children?: ReactNode | ((details: SliderValueTextDetails) => ReactNode);
  "data-slot"?: string;
}
export const SliderValueText = forwardRef<HTMLOutputElement, SliderValueTextProps>(function SliderValueText(
  { render, asChild, children, "data-slot": dataSlot = "slider-value-text", ...props }, ref,
) {
  const context = useSliderContext();
  const details = { values: context.values, value: context.isRange ? context.values : context.values[0] };
  const content = typeof children === "function" ? children(details) : children ?? context.values.join(" – ");
  const behavior = { ...props, ref, id: props.id ?? context.ids.valueText, "data-slot": dataSlot, children: content };
  if (asChild) return cloneAndMerge(content, { ...behavior, children: undefined });
  return renderElement(render, "output", behavior);
});

export interface SliderMarkerGroupProps extends NativeDivProps<"children">, SliderCompositionProps { children?: ReactNode; "data-slot"?: string; }
export const SliderMarkerGroup = forwardRef<HTMLDivElement, SliderMarkerGroupProps>(function SliderMarkerGroup(
  { render, asChild, children, "data-slot": dataSlot = "slider-marker-group", ...props }, ref,
) {
  const context = useSliderContext();
  const behavior = { ...props, ref, id: props.id ?? context.ids.markerGroup, "aria-hidden": true, "data-slot": dataSlot, "data-orientation": context.orientation };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "div", { ...behavior, children });
});

export interface SliderMarkerProps extends NativeSpanProps<"children">, SliderCompositionProps { value: number; children?: ReactNode; "data-slot"?: string; }
export const SliderMarker = forwardRef<HTMLSpanElement, SliderMarkerProps>(function SliderMarker(
  { value, render, asChild, children, style, "data-slot": dataSlot = "slider-marker", ...props }, ref,
) {
  const context = useSliderContext();
  const state = context.getMarkerState(value);
  const behavior = {
    ...props, ref, "aria-hidden": true, "data-slot": dataSlot, "data-value": value,
    "data-percent": state.percent, ...(state.selected && { "data-selected": "" }),
    style: { ...style, ...context.getMarkerOffsetStyle(value) }, children,
  };
  if (asChild) return cloneAndMerge(children, { ...behavior, children: undefined });
  return renderElement(render, "span", behavior);
});

function decorativePart(defaultSlot: string) {
  return forwardRef<HTMLSpanElement, NativeSpanProps<"children"> & SliderCompositionProps & { children?: ReactNode; "data-slot"?: string }>(
    function SliderDecorativePart({ render, asChild, children, "data-slot": dataSlot = defaultSlot, ...props }, ref) {
      const behavior = { ...props, ref, "aria-hidden": true, "data-slot": dataSlot };
      return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "span", { ...behavior, children });
    },
  );
}
export const SliderMarkerIndicator = decorativePart("slider-marker-indicator");
export const SliderMarkerLabel = decorativePart("slider-marker-label");

export interface SliderDraggingIndicatorDetails { index: number; value: number; percent: number; }
export interface SliderDraggingIndicatorProps extends NativeSpanProps<"children">, SliderCompositionProps {
  index?: number;
  children?: ReactNode | ((details: SliderDraggingIndicatorDetails) => ReactNode);
  "data-slot"?: string;
}
export const SliderDraggingIndicator = forwardRef<HTMLSpanElement, SliderDraggingIndicatorProps>(function SliderDraggingIndicator(
  { index, render, asChild, children, "data-slot": dataSlot = "slider-dragging-indicator", ...props }, ref,
) {
  const context = useSliderContext();
  const activeIndex = index ?? context.draggingIndex ?? 0;
  const state = context.getThumbState(activeIndex);
  const active = context.draggingIndex !== null && (index === undefined || index === context.draggingIndex);
  const details = { index: activeIndex, value: state.value, percent: state.percent };
  const content = typeof children === "function" ? children(details) : children ?? state.value;
  const behavior = { ...props, ref, hidden: !active, "aria-hidden": true, "data-slot": dataSlot, "data-state": active ? "open" : "closed", "data-index": activeIndex, children: content };
  if (asChild) return cloneAndMerge(content, { ...behavior, children: undefined });
  return renderElement(render, "span", behavior);
});

export interface SliderHiddenInputProps extends NativeInputProps<"type" | "name" | "value" | "disabled"> { index?: number; "data-slot"?: string; }
export const SliderHiddenInput = forwardRef<HTMLInputElement, SliderHiddenInputProps>(function SliderHiddenInput(
  { index = 0, "data-slot": dataSlot = "slider-hidden-input", ...props }, ref,
) {
  const context = useSliderContext();
  return <input {...props} {...context.getHiddenInputProps(index)} ref={ref} data-slot={dataSlot} />;
});

export interface SliderContextProps { children: (controller: SliderController) => ReactNode; }
export function SliderContext({ children }: SliderContextProps) { return children(useSliderContext()); }
