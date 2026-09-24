"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useId,
  useState,
  Children,
  isValidElement,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { formControlProxyStyle, useFormControlProxy } from "../../hooks/useFormControlProxy.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
  composeRefs,
} from "../../utils/slot.js";
import {
  RatingContextProvider,
  type RatingContextValue,
} from "./context.js";
import {
  clampRatingValue,
  getRatingItemState,
  getRatingValueLabel,
  normalizeRatingRange,
  snapRatingValue,
} from "./utils.js";
import { useFieldContext } from "../field/context.js";
import type { ValidationBehavior } from "../form/validation.js";
import { useFieldsetContext } from "../fieldset/context.js";
import { useRating, ratingControllerGuards, type RatingController } from "./useRating.js";

type RatingRootNativeProps = NativeDivProps<
  | "children"
  | "defaultValue"
  | "onChange"
  | "role"
  | "tabIndex"
  | "aria-valuemin"
  | "aria-valuemax"
  | "aria-valuenow"
  | "aria-valuetext"
  | "onKeyDown"
  | "inputMode"
>;

interface RatingPointerSession {
  pointerId: number;
  initialValue: number;
  currentValue: number;
  moved: boolean;
}

export interface RatingRootProps extends RatingRootNativeProps {
  /** Hover previews do not change the committed form value. */
  onHoverChange?: (value: number | null) => void;
  /** Automatic inputs by default; manual requires one HiddenInput. */
  inputMode?: "auto" | "manual";
  ids?: { root?: string; label?: string; control?: string; input?: string };
  autoFocus?: boolean;
  /** Controlled rating value. */
  value?: number;
  /** Initial rating value for uncontrolled mode. */
  defaultValue?: number;
  /** Called when the rating value changes. */
  onValueChange?: (value: number) => void;
  /** Allow activating the selected value again to clear to the minimum. */
  allowClear?: boolean;
  /** Minimum rating value. */
  min?: number;
  /** Maximum rating value. */
  max?: number;
  /** Value step for pointer and keyboard changes. */
  step?: number;
  /** Larger keyboard step for Page Up and Page Down. */
  largeStep?: number;
  /** Disable interaction. */
  disabled?: boolean;
  /** Keep the rating focusable and readable but prevent edits. */
  readOnly?: boolean;
  /** Mark the rating invalid. */
  invalid?: boolean;
  /** Mark the rating required. */
  required?: boolean;
  /** Text direction used for horizontal pointer and keyboard behavior. */
  dir?: DirectionValue;
  /** HTML name attribute for hidden form input. */
  name?: string;
  /** Hidden input value. */
  formValue?: string;
  /** Associates the hidden input with a form by ID. */
  form?: string;
  /** Chooses inline Atom presentation or the browser's native validation UI. */
  validationBehavior?: ValidationBehavior;
  /** Human-readable value text for assistive technologies. */
  "aria-valuetext"?: string;
  /** Generate human-readable value text for assistive technologies. */
  getValueLabel?: (value: number, min: number, max: number) => string;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Rating item parts. */
  children?: ReactNode;
  /** Native tab index override. */
  tabIndex?: number;
  /** Consumer keydown handler composed before Atom keyboard behavior. */
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const RatingRoot = forwardRef<HTMLDivElement, RatingRootProps>(function RatingRoot(props, ref) {
  const controller = useRating(props);
  return <RatingRootProvider {...props} controller={controller} ref={ref} />;
});

export interface RatingRootProviderProps extends Omit<RatingRootProps, "value" | "defaultValue" | "onValueChange"> {
  controller: RatingController;
}

export const RatingRootProvider = forwardRef<HTMLDivElement, RatingRootProviderProps>(
  function RatingRootProvider(
    providerProps,
    ref,
  ) {
    const { controller } = providerProps;
    const
    {
      value,
      defaultValue,
      onValueChange,
      onHoverChange,
      inputMode = "auto",
      ids,
      autoFocus,
      controller: _controller,
      allowClear = false,
      min: minProp = 0,
      max: maxProp = 5,
      step: stepProp = 1,
      largeStep: largeStepProp,
      disabled,
      readOnly,
      invalid,
      required,
      dir: dirProp,
      name,
      formValue,
      form,
      validationBehavior,
      "aria-valuetext": ariaValueText,
      getValueLabel,
      render,
      asChild,
      children,
      tabIndex,
      onKeyDown,
      "data-slot": dataSlot = "rating",
      ...restProps
    } = { ...controller.options, ...providerProps };
    const field = useFieldContext();
    const fieldset = useFieldsetContext();
    const [nativeDisabled, setNativeDisabled] = useState(false);
    const isDisabled = nativeDisabled || !!fieldset?.disabled || (disabled ?? field?.disabled ?? false);
    const isReadOnly = readOnly ?? field?.readOnly ?? false;
    const isRequired = required ?? field?.required ?? false;
    const rootRef = useRef<HTMLDivElement>(null);
    const generatedId = useId();
    const rootId = restProps.id ?? ids?.root ?? field?.controlId ?? `rating-${generatedId}`;
    const labelId = ids?.label ?? `${rootId}-label`;
    let authoredLabel: string | undefined;
    let authoredInputCount = 0;
    const inspectParts = (nodes: ReactNode) => Children.forEach(nodes, child => {
      if (!isValidElement<{ id?: string; children?: ReactNode }>(child)) return;
      const part = (child.type as unknown as Record<symbol, string>)[Symbol.for("flowstack.rating.part")];
      if (part === "label") authoredLabel = child.props.id ?? labelId;
      if (part === "input") authoredInputCount += 1;
      inspectParts(child.props.children);
    });
    inspectParts(children);
    if (authoredInputCount > 1 || (inputMode === "auto" && authoredInputCount)) {
      throw new Error('Rating accepts one HiddenInput, only in inputMode="manual"');
    }
    const [registeredLabel, setRegisteredLabel] = useState<string>();
    const hiddenInputOwner = useRef<symbol | null>(null);
    useEffect(() => {
      const root = rootRef.current;
      const Observer = root?.ownerDocument.defaultView?.MutationObserver;
      if (!root || !Observer) return;
      const sync = () => {
        let ancestor = root.parentElement;
        let disabledByFieldset = false;
        while (ancestor) {
          if (ancestor.tagName === "FIELDSET" && (ancestor as HTMLFieldSetElement).disabled) {
            const legend = Array.from(ancestor.children).find(child => child.tagName === "LEGEND");
            if (!legend?.contains(root)) disabledByFieldset = true;
          }
          ancestor = ancestor.parentElement;
        }
        setNativeDisabled(disabledByFieldset);
      };
      sync();
      const observer = new Observer(sync);
      observer.observe(root.ownerDocument.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["disabled"] });
      return () => observer.disconnect();
    }, []);
    useEffect(() => {
      const guards = ratingControllerGuards.get(controller);
      const guard = () => !isDisabled && !isReadOnly;
      guards?.add(guard);
      return () => { guards?.delete(guard); };
    }, [controller, isDisabled, isReadOnly]);
    const autofocusDone = useRef(false);
    useEffect(() => {
      if (autofocusDone.current) return;
      autofocusDone.current = true;
      if (autoFocus && !isDisabled && !validationInputRef.current?.matches(":disabled")) rootRef.current?.focus();
    }, [autoFocus, isDisabled]);
    const pointerSessionRef = useRef<RatingPointerSession | null>(null);
    const validationInputRef = useRef<HTMLInputElement>(null);
    useFormControlProxy(validationInputRef, rootRef);
    const validation = useFormValidation({
      validityRef: validationInputRef,
      ownerRef: rootRef,
      invalid,
      inheritedInvalid: field?.invalid,
      validationBehavior,
      inheritedValidationBehavior: field?.validationBehavior,
      form,
      reportValidity: field?.reportControlValidity,
      clearOnReset: false,
    });
    const isInvalid = validation.invalid;
    const range = useMemo(
      () => normalizeRatingRange(minProp, maxProp),
      [maxProp, minProp],
    );
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const step = Number.isFinite(stepProp) && stepProp > 0 ? stepProp : 1;
    const largeStep =
      (Number.isFinite(largeStepProp) && largeStepProp! > 0 ? largeStepProp : undefined) ??
      Math.min(
        step * 10,
        step * Math.ceil((range.max - range.min) / 2 / step),
      );
    const ratingValue = controller.value;
    const setRatingValue = controller.setValue;
    const clampedValue = clampRatingValue(ratingValue, range.min, range.max);
    const reset = useCallback(() => {
      if (!rootRef.current) return;
      pointerSessionRef.current = null;
      controller.reset();
      validation.clearNativeInvalid();
    }, [controller.reset, validation.clearNativeInvalid]);
    useFormReset(rootRef, form, false, reset);
    useEffect(() => {
      pointerSessionRef.current = null;
      controller.setHoveredValue(null);
    }, [isDisabled, isReadOnly, range.min, range.max, step]);
    useEffect(() => () => {
      const session = pointerSessionRef.current;
      if (session) {
        for (const item of rootRef.current?.querySelectorAll<HTMLElement>('[data-slot="rating-item"]') ?? []) {
          if (item.hasPointerCapture?.(session.pointerId)) item.releasePointerCapture?.(session.pointerId);
        }
      }
      pointerSessionRef.current = null;
    }, [isDisabled, isReadOnly, range.min, range.max, step]);
    useEffect(() => {
      if (inputMode === "manual" && !hiddenInputOwner.current) {
        throw new Error('Rating inputMode="manual" requires one HiddenInput');
      }
    }, [inputMode, children]);
    const valueText =
      ariaValueText ??
      getValueLabel?.(clampedValue, range.min, range.max) ??
      getRatingValueLabel(clampedValue, range.min, range.max);

    const setValue = useCallback(
      (nextValue: number) => {
        if (isDisabled || isReadOnly) return;
        const snapped = snapRatingValue(nextValue, step, range.min);
        setRatingValue(clampRatingValue(snapped, range.min, range.max));
      },
      [isDisabled, isReadOnly, range.max, range.min, setRatingValue, step],
    );

    const getItemState = useCallback(
      (itemValue: number) => getRatingItemState(controller.previewValue, itemValue, range.min),
      [controller.previewValue, range.min],
    );

    const beginPointerInteraction = useCallback(
      (pointerId: number, pointerValue: number) => {
        if (isDisabled || isReadOnly || pointerSessionRef.current) return false;
        pointerSessionRef.current = {
          pointerId,
          initialValue: clampedValue,
          currentValue: pointerValue,
          moved: false,
        };
        setValue(pointerValue);
        return true;
      },
      [clampedValue, isDisabled, isReadOnly, setValue],
    );

    const movePointerInteraction = useCallback(
      (pointerId: number, pointerValue: number) => {
        const session = pointerSessionRef.current;
        if (!session || session.pointerId !== pointerId) return;
        session.currentValue = pointerValue;
        session.moved = true;
        setValue(pointerValue);
      },
      [setValue],
    );

    const endPointerInteraction = useCallback(
      (pointerId: number, _itemValue: number) => {
        const session = pointerSessionRef.current;
        if (!session || session.pointerId !== pointerId) return;
        pointerSessionRef.current = null;
        if (
          allowClear &&
          !session.moved &&
          session.currentValue === session.initialValue &&
          session.initialValue > range.min
        ) {
          setValue(range.min);
        }
      },
      [allowClear, range.min, setValue],
    );

    const finishPointerInteraction = useCallback(
      (pointerId: number) => {
        const session = pointerSessionRef.current;
        if (!session || session.pointerId !== pointerId) return;
        pointerSessionRef.current = null;
      },
      [],
    );

    const cancelPointerInteraction = useCallback(
      (pointerId: number) => {
        const session = pointerSessionRef.current;
        if (!session || session.pointerId !== pointerId) return;
        pointerSessionRef.current = null;
        setValue(session.initialValue);
      },
      [setValue],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
      (event) => {
        if (isDisabled || isReadOnly) return;

        let nextValue = clampedValue;
        let handled = true;

        switch (event.key) {
          case "ArrowRight":
            nextValue += dir === "rtl" ? -step : step;
            break;
          case "ArrowLeft":
            nextValue += dir === "rtl" ? step : -step;
            break;
          case "ArrowUp":
            nextValue += step;
            break;
          case "ArrowDown":
            nextValue -= step;
            break;
          case "PageUp":
            nextValue += largeStep;
            break;
          case "PageDown":
            nextValue -= largeStep;
            break;
          case "Home":
            nextValue = range.min;
            break;
          case "End":
            nextValue = range.max;
            break;
          default:
            handled = false;
        }

        if (!handled) return;
        event.preventDefault();
        controller.setHoveredValue(null);
        setValue(nextValue);
      },
      [
        clampedValue,
        isDisabled,
        dir,
        largeStep,
        range.max,
        range.min,
        isReadOnly,
        setValue,
        step,
        controller.setHoveredValue,
      ],
    );

    const contextValue = useMemo<RatingContextValue>(
      () => ({
        value: clampedValue,
        hoveredValue: controller.hoveredValue,
        previewValue: controller.previewValue,
        setHoveredValue: controller.setHoveredValue,
        clearValue: controller.clearValue,
        items: controller.items,
        rootRef,
        rootId,
        labelId,
        controlId: ids?.control ?? `${rootId}-control`,
        setRegisteredLabel,
        inputMode,
        hiddenInputOwner,
        input: { name, form, formValue, id: ids?.input },
        min: range.min,
        max: range.max,
        step,
        disabled: isDisabled,
        readOnly: isReadOnly,
        invalid: isInvalid,
        required: isRequired,
        dir,
        setValue,
        getItemState,
        beginPointerInteraction,
        movePointerInteraction,
        endPointerInteraction,
        finishPointerInteraction,
        cancelPointerInteraction,
      }),
      [
        controller, rootId, labelId, ids, inputMode, name, form, formValue,
        clampedValue,
        isDisabled,
        getItemState,
        isInvalid,
        range.max,
        range.min,
        isReadOnly,
        isRequired,
        dir,
        setValue,
        step,
        beginPointerInteraction,
        movePointerInteraction,
        endPointerInteraction,
        finishPointerInteraction,
        cancelPointerInteraction,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(rootRef, ref),
      id: rootId,
      role: "slider",
      tabIndex: isDisabled ? -1 : tabIndex ?? 0,
      "aria-valuemin": range.min,
      "aria-valuemax": range.max,
      "aria-valuenow": clampedValue,
      "aria-valuetext": valueText,
      "aria-labelledby": restProps["aria-labelledby"] ??
        (restProps["aria-label"] === undefined ? authoredLabel ?? registeredLabel ?? field?.labelId : undefined),
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : field?.describedBy,
      ...(isDisabled && { "aria-disabled": true, "data-disabled": "" }),
      ...(isReadOnly && { "aria-readonly": true, "data-readonly": "" }),
      ...(isInvalid && { "aria-invalid": true, "data-invalid": "" }),
      ...(isRequired && { "aria-required": true, "data-required": "" }),
      "data-slot": dataSlot,
      dir,
      "data-value": clampedValue,
      "data-min": range.min,
      "data-max": range.max,
      "data-step": step,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      onPointerLeave: composeEventHandlers(restProps.onPointerLeave, () => controller.setHoveredValue(null)),
    };

    const root = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <RatingContextProvider value={contextValue}>
        {isRequired ? (
          <input
            ref={validationInputRef}
            type="checkbox"
            checked={clampedValue > range.min}
            required
            disabled={isDisabled}
            form={form}
            aria-hidden="true"
            tabIndex={-1}
            onFocus={() => rootRef.current?.focus()}
            {...validation.validationProps}
            style={formControlProxyStyle}
          />
        ) : null}
        {root}
        {name && inputMode === "auto" ? (
          <input
            type="hidden"
            name={name}
            value={formValue ?? String(clampedValue)}
            form={form}
            disabled={isDisabled}
          />
        ) : null}
      </RatingContextProvider>
    );
  },
);
