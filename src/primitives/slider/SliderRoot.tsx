"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { SliderContextProvider } from "./context.js";
import { useSlider, type SliderController, type UseSliderProps } from "./useSlider.js";

type SliderRootNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange" | "dir">;

export interface SliderRootProps extends SliderRootNativeProps, UseSliderProps {
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export interface SliderRootProviderProps extends SliderRootNativeProps {
  value: SliderController;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export const SliderRootProvider = forwardRef<HTMLElement, SliderRootProviderProps>(
  function SliderRootProvider(
    {
      value: controller,
      render,
      asChild,
      children,
      className,
      style,
      "data-slot": dataSlot = "slider",
      ...restProps
    },
    ref,
  ) {
    const composedRef = useMemo(() => composeRefs(controller.rootRef, ref), [controller.rootRef, ref]);
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: restProps.id ?? controller.ids.root,
      dir: controller.dir,
      "data-slot": dataSlot,
      "data-orientation": controller.orientation,
      "data-origin": controller.origin,
      "data-thumb-alignment": controller.thumbAlignment,
      "data-collision": controller.thumbCollisionBehavior,
      ...(controller.disabled && { "data-disabled": "" }),
      ...(controller.readOnly && { "data-readonly": "" }),
      ...(controller.invalid && { "data-invalid": "" }),
      ...(controller.required && { "data-required": "" }),
      className,
      style,
    };
    const root = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });
    const hiddenInputs = controller.hiddenInputMode === "automatic" && controller.name
      ? controller.values.map((_, index) => (
          <input key={index} data-slot="slider-hidden-input" {...controller.getHiddenInputProps(index)} />
        ))
      : null;
    return (
      <SliderContextProvider value={controller}>
        {root}
        {hiddenInputs}
      </SliderContextProvider>
    );
  },
);

export const SliderRoot = forwardRef<HTMLElement, SliderRootProps>(
  function SliderRoot(props, ref) {
    const {
      value, defaultValue, onValueChange, onValueCommit, onFocusChange,
      min, max, step, largeStep, minStepsBetweenThumbs,
      disabled, readOnly, invalid, required, orientation, dir, origin,
      thumbAlignment, thumbSize, thumbCollisionBehavior, hiddenInputMode,
      name, form, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby, ariaValueText, ...rootProps
    } = props;
    const controller = useSlider({
      value, defaultValue, onValueChange, onValueCommit, onFocusChange,
      min, max, step, largeStep, minStepsBetweenThumbs,
      disabled, readOnly, invalid, required, orientation, dir, origin,
      thumbAlignment, thumbSize, thumbCollisionBehavior, hiddenInputMode,
      name, form, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby, ariaValueText,
    });
    return <SliderRootProvider {...rootProps} ref={ref} value={controller} />;
  },
);

export type { SliderCollisionBehavior } from "./utils.js";
export type {
  SliderController, SliderHiddenInputMode, SliderOrientation, SliderOrigin,
  SliderRangeState, SliderThumbAlignment, SliderThumbBehaviorProps,
  SliderThumbSize, SliderThumbState, SliderValue, UseSliderProps,
} from "./useSlider.js";
